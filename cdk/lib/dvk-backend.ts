import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { FieldLogLevel } from '@aws-cdk/aws-appsync-alpha';
import * as path from 'path';
import lambdaFunctions from './lambda/graphql/lambdaFunctions';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import Config from './config';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import apiLambdaFunctions from './lambda/api/apiLambdaFunctions';

export class DvkBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, env: string) {
    super(scope, id, props);
    const api = new appsync.GraphqlApi(this, 'DVKGraphqlApi', {
      name: 'dvk-graphql-api-' + env,
      schema: appsync.Schema.fromAsset(path.join(__dirname, '../graphql/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.atDate(this.createApiKeyExpiration()),
          },
        },
        additionalAuthorizationModes: [{ authorizationType: appsync.AuthorizationType.IAM }],
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.NONE,
        excludeVerboseContent: true,
      },
      xrayEnabled: false,
    });
    const fairwayTable = this.createFairwayTable(env);
    for (const lambdaFunc of lambdaFunctions) {
      const typeName = lambdaFunc.typeName || this.parseTypeName(lambdaFunc.entry);
      const fieldName = lambdaFunc.fieldName || this.parseFieldName(lambdaFunc.entry);
      const backendLambda = new NodejsFunction(this, `GraphqlAPIHandler-${typeName}-${fieldName}-${env}`, {
        functionName: `${typeName}-${fieldName}-${env}`.toLocaleLowerCase(),
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
        environment: {
          FAIRWAY_TABLE: fairwayTable.tableName,
          LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
        },
        logRetention: Config.isPermanentEnvironment() ? RetentionDays.ONE_WEEK : RetentionDays.ONE_DAY,
      });
      const lambdaDataSource = api.addLambdaDataSource(`lambdaDatasource-${typeName}-${fieldName}`, backendLambda);
      lambdaDataSource.createResolver({
        typeName: typeName,
        fieldName: fieldName,
      });
      if (typeName === 'Mutation') {
        fairwayTable.grantReadWriteData(backendLambda);
      } else {
        fairwayTable.grantReadData(backendLambda);
      }
    }
    const alb = this.createALB(env);
    new cdk.CfnOutput(this, 'LoadBalancerAPIURL', {
      value: alb.loadBalancerDnsName || '',
      exportName: 'LoadBalancerAPIURL' + env,
    });
    new cdk.CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
      exportName: 'AppSyncAPIKey' + env,
    });
    new cdk.CfnOutput(this, 'AppSyncAPIURL', {
      value: api.graphqlUrl || '',
      exportName: 'AppSyncAPIURL' + env,
    });
  }

  private createFairwayTable(env: string): Table {
    return new Table(this, 'FairwayTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `Fairway-${env}`,
      partitionKey: {
        name: 'id',
        type: AttributeType.NUMBER,
      },
    });
  }

  private parseFieldName(entry: string): string {
    // parse handler name from entry removing -handler.ts
    // example /home/xxx/dvk/cdk/lib/lambda/graphql/query/fairway-handler.ts => fairway
    const start = entry.lastIndexOf('/');
    const end = entry.indexOf('-', start);
    return entry.substring(start + 1, end);
  }

  private parseTypeName(entry: string): string {
    // parse last folder name from entry
    // example /home/xxx/dvk/cdk/lib/lambda/graphql/query/fairways-handler.ts => Query
    const end = entry.lastIndexOf('/');
    const start = entry.substring(0, end).lastIndexOf('/');
    return entry.substring(start + 1, start + 2).toUpperCase() + entry.substring(start + 2, end);
  }

  private createApiKeyExpiration() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), 1, 0, 0, 0, 0));
  }

  private createALB(env: string): ApplicationLoadBalancer {
    const vpc = Vpc.fromLookup(this, 'DvkVPC', { vpcName: 'DvkDev-VPC' });
    const alb = new ApplicationLoadBalancer(this, `ALB-${env}`, { vpc, internetFacing: false, loadBalancerName: `DvkALB-${env}` });
    const httpListener = alb.addListener('HTTPListener', {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.fixedResponse(404),
    });
    let index = 1;
    for (const lambdaFunc of apiLambdaFunctions) {
      const functionName = lambdaFunc.functionName || this.parseFieldName(lambdaFunc.entry);
      const backendLambda = new NodejsFunction(this, `APIHandler-${functionName}-${env}`, {
        functionName: `${functionName}-${env}`.toLocaleLowerCase(),
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
        environment: {
          LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
        },
        logRetention: Config.isPermanentEnvironment() ? RetentionDays.ONE_WEEK : RetentionDays.ONE_DAY,
      });
      httpListener.addTargets(`HTTPListenerTarget-${functionName}`, {
        targets: [new LambdaTarget(backendLambda)],
        priority: index++,
        conditions: [ListenerCondition.pathPatterns([lambdaFunc.pathPattern])],
      });
    }
    return alb;
  }
}

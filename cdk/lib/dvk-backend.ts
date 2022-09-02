import { Fn, Stack, StackProps, Tags } from 'aws-cdk-lib';
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
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import apiLambdaFunctions from './lambda/api/apiLambdaFunctions';
import { WafConfig } from './wafConfig';
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
    const config = new Config(this);
    if (Config.isPermanentEnvironment()) {
      new WafConfig(this, 'DVK-WAF', api, Fn.split('\n', config.getStringParameter('WAFAllowedAddresses')));
    }
    const fairwayCardTable = this.createFairwayCardTable(env);
    for (const lambdaFunc of lambdaFunctions) {
      const typeName = lambdaFunc.typeName;
      const fieldName = lambdaFunc.fieldName;
      const backendLambda = new NodejsFunction(this, `GraphqlAPIHandler-${typeName}-${fieldName}-${env}`, {
        functionName: `${typeName}-${fieldName}-${env}`.toLocaleLowerCase(),
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
        environment: {
          FAIRWAY_CARD_TABLE: fairwayCardTable.tableName,
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
        fairwayCardTable.grantReadWriteData(backendLambda);
      } else {
        fairwayCardTable.grantReadData(backendLambda);
      }
    }
    Tags.of(fairwayCardTable).add('Backups-' + Config.getEnvironment(), 'true');
    const alb = this.createALB(env);
    new cdk.CfnOutput(this, 'LoadBalancerDnsName', {
      value: alb.loadBalancerDnsName || '',
      exportName: 'LoadBalancerDnsName' + env,
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

  private createFairwayCardTable(env: string): Table {
    return new Table(this, 'FairwayCardTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `FairwayCard-${env}`,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      pointInTimeRecovery: true,
    });
  }

  private createApiKeyExpiration() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), 1, 0, 0, 0, 0));
  }

  private createALB(env: string): ApplicationLoadBalancer {
    const vpc = Vpc.fromLookup(this, 'DvkVPC', { vpcName: this.getVPCName(env) });
    let securityGroup: SecurityGroup | undefined = undefined;
    if (!Config.isPermanentEnvironment()) {
      securityGroup = new SecurityGroup(this, `DVKALBSecurityGroup-${env}`, { vpc });
      securityGroup.addIngressRule(
        Peer.ipv4(`${Config.getPublicIP() + (Config.getPublicIP().indexOf('/') === -1 ? '/32' : '')}`),
        Port.tcp(80),
        `Developer ip for ${env}`
      );
    }
    const alb = new ApplicationLoadBalancer(this, `ALB-${env}`, {
      vpc,
      internetFacing: !Config.isPermanentEnvironment(),
      loadBalancerName: `DvkALB-${env}`,
      securityGroup,
    });
    const httpListener = alb.addListener('HTTPListener', {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.fixedResponse(404),
      open: Config.isPermanentEnvironment(),
    });
    let index = 1;
    // add CORS config
    const corsLambda = new NodejsFunction(this, `APIHandler-CORS-${env}`, {
      functionName: `cors-${env}`.toLocaleLowerCase(),
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: path.join(__dirname, 'lambda/api/cors-handler.ts'),
      handler: 'handler',
      environment: {
        LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
      },
      logRetention: Config.isPermanentEnvironment() ? RetentionDays.ONE_WEEK : RetentionDays.ONE_DAY,
    });
    httpListener.addTargets('HTTPListenerTarget-CORS', {
      targets: [new LambdaTarget(corsLambda)],
      priority: index++,
      conditions: [ListenerCondition.httpRequestMethods(['OPTIONS'])],
    });
    for (const lambdaFunc of apiLambdaFunctions) {
      const functionName = lambdaFunc.functionName;
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

  private getVPCName(env: string): string {
    if (env === 'dev') {
      return 'DvkDev-VPC';
    } else if (env === 'test') {
      return 'DvkTest-VPC';
    } else {
      return 'Default-VPC';
    }
  }
}

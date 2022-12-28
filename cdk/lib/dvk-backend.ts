import { Duration, Fn, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { FieldLogLevel } from '@aws-cdk/aws-appsync-alpha';
import * as path from 'path';
import lambdaFunctions from './lambda/graphql/lambdaFunctions';
import { Table, AttributeType, BillingMode, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import Config from './config';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import apiLambdaFunctions from './lambda/api/apiLambdaFunctions';
import { WafConfig } from './wafConfig';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, BucketProps } from 'aws-cdk-lib/aws-s3';
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
      try {
        new WafConfig(this, 'DVK-WAF', api, Fn.split('\n', config.getStringParameter('WAFAllowedAddresses')));
      } catch (e) {
        // to keep SonarLint happy WafConfig created inside try catch
        console.log('WAF config failed: %s', e);
      }
    }
    const fairwayCardTable = this.createFairwayCardTable();
    const harborTable = this.createHarborTable();
    for (const lambdaFunc of lambdaFunctions) {
      const typeName = lambdaFunc.typeName;
      const fieldName = lambdaFunc.fieldName;
      const backendLambda = new NodejsFunction(this, `GraphqlAPIHandler-${typeName}-${fieldName}-${env}`, {
        functionName: `${typeName}-${fieldName}-${env}`.toLocaleLowerCase(),
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
        environment: {
          FAIRWAY_CARD_TABLE: Config.getFairwayCardTableName(),
          HARBOR_TABLE: Config.getHarborTableName(),
          ENVIRONMENT: Config.getEnvironment(),
          LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
          TZ: 'Europe/Helsinki',
        },
        logRetention: Config.isPermanentEnvironment() ? RetentionDays.ONE_WEEK : RetentionDays.ONE_DAY,
      });
      const lambdaDataSource = api.addLambdaDataSource(`lambdaDatasource_${typeName}_${fieldName}`, backendLambda);
      lambdaDataSource.createResolver({
        typeName: typeName,
        fieldName: fieldName,
      });
      if (typeName === 'Mutation') {
        fairwayCardTable.grantReadWriteData(backendLambda);
        harborTable.grantReadWriteData(backendLambda);
      } else {
        fairwayCardTable.grantReadData(backendLambda);
        harborTable.grantReadData(backendLambda);
      }
      backendLambda.addToRolePolicy(new PolicyStatement({ effect: Effect.ALLOW, actions: ['ssm:GetParametersByPath'], resources: ['*'] }));
    }
    Tags.of(fairwayCardTable).add('Backups-' + Config.getEnvironment(), 'true');
    Tags.of(harborTable).add('Backups-' + Config.getEnvironment(), 'true');
    const bucket = this.createCacheBucket(env);
    const alb = this.createALB(env, fairwayCardTable, harborTable, bucket);
    try {
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
    } catch (e) {
      // to keep SonarLint happy CfnOutput created inside try catch
      console.log('CloudFormation output failed: %s', e);
    }
  }

  private createFairwayCardTable(): Table {
    const table = new Table(this, 'FairwayCardTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: Config.getFairwayCardTableName(),
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      pointInTimeRecovery: true,
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });
    table.addGlobalSecondaryIndex({
      indexName: 'FairwayCardByFairwayIdIndex',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      projectionType: ProjectionType.KEYS_ONLY,
      sortKey: { name: 'fairwayIds', type: AttributeType.STRING },
    });
    return table;
  }

  private createHarborTable(): Table {
    return new Table(this, 'HarborTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: Config.getHarborTableName(),
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      pointInTimeRecovery: true,
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });
  }

  private createApiKeyExpiration() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), 1, 0, 0, 0, 0));
  }

  private createCacheBucket(env: string): Bucket {
    const s3DeletePolicy: Pick<BucketProps, 'removalPolicy' | 'autoDeleteObjects'> = {
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: Config.isPermanentEnvironment() ? undefined : true,
    };
    return new Bucket(this, 'FeatureBucket', {
      bucketName: `featurecache-${env}`,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      ...s3DeletePolicy,
      lifecycleRules: [{ expiration: Duration.days(1) }],
    });
  }

  private createALB(env: string, fairwayCardTable: Table, harborTable: Table, cacheBucket: Bucket): ApplicationLoadBalancer {
    const vpc = Vpc.fromLookup(this, 'DvkVPC', { vpcName: this.getVPCName(env) });
    const alb = new ApplicationLoadBalancer(this, `ALB-${env}`, {
      vpc,
      internetFacing: false,
      loadBalancerName: `DvkALB-${env}`,
    });
    const httpListener = alb.addListener('HTTPListener', {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.fixedResponse(404),
      open: true,
    });
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
      priority: 1,
      conditions: [ListenerCondition.httpRequestMethods(['OPTIONS'])],
    });
    for (const lambdaFunc of apiLambdaFunctions) {
      const functionName = lambdaFunc.functionName;
      const backendLambda = new NodejsFunction(this, `APIHandler-${functionName}-${env}`, {
        functionName: `${functionName}-${env}`.toLocaleLowerCase(),
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
        timeout: Duration.seconds(30),
        environment: {
          LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
          ENVIRONMENT: Config.getEnvironment(),
          FAIRWAY_CARD_TABLE: Config.getFairwayCardTableName(),
          HARBOR_TABLE: Config.getHarborTableName(),
          TZ: 'Europe/Helsinki',
        },
        logRetention: Config.isPermanentEnvironment() ? RetentionDays.ONE_WEEK : RetentionDays.ONE_DAY,
      });
      httpListener.addTargets(`HTTPListenerTarget-${functionName}`, {
        targets: [new LambdaTarget(backendLambda)],
        priority: lambdaFunc.priority,
        conditions: [ListenerCondition.pathPatterns([lambdaFunc.pathPattern])],
      });
      fairwayCardTable.grantReadData(backendLambda);
      harborTable.grantReadData(backendLambda);
      cacheBucket.grantPut(backendLambda);
      cacheBucket.grantRead(backendLambda);
      backendLambda.addToRolePolicy(new PolicyStatement({ effect: Effect.ALLOW, actions: ['ssm:GetParametersByPath'], resources: ['*'] }));
    }
    return alb;
  }

  private getVPCName(env: string): string {
    if (env === 'dev') {
      return 'DvkDev-VPC';
    } else if (env === 'test') {
      return 'DvkTest-VPC';
    } else if (env === 'prod') {
      return 'DVKProd-VPC';
    } else {
      return 'DvkDev-VPC';
    }
  }
}

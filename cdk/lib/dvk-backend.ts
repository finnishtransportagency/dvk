import { Duration, Fn, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { FieldLogLevel } from 'aws-cdk-lib/aws-appsync';
import * as path from 'path';
import lambdaFunctions from './lambda/graphql/lambdaFunctions';
import { Table, AttributeType, BillingMode, ProjectionType, StreamViewType } from 'aws-cdk-lib/aws-dynamodb';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import Config from './config';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ListenerAction,
  ListenerCondition,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import apiLambdaFunctions from './lambda/api/apiLambdaFunctions';
import { WafConfig } from './wafConfig';
import { CanonicalUserPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, BucketProps, LifecycleRule } from 'aws-cdk-lib/aws-s3';
import { ILayerVersion, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { getNewStaticBucketName } from './lambda/environment';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class DvkBackendStack extends Stack {
  private domainName: string;

  private siteSubDomain: string;

  constructor(scope: Construct, id: string, props: StackProps, env: string) {
    super(scope, id, props);
    this.domainName = env === 'prod' ? 'vaylapilvi.fi' : 'testivaylapilvi.fi';
    this.siteSubDomain = env === 'prod' ? 'dvk' : 'dvk' + env;
    const api = new appsync.GraphqlApi(this, 'DVKGraphqlApi', {
      name: 'dvk-graphql-api-' + env,
      definition: appsync.Definition.fromFile(path.join(__dirname, '../graphql/schema.graphql')),
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
    // Configure the appsync cache for permantn environments using CfnApiCache
    if (Config.isPermanentEnvironment()) {
      new appsync.CfnApiCache(this, 'DvkApiCache' + env, {
        apiCachingBehavior: 'PER_RESOLVER_CACHING',
        apiId: api.apiId,
        type: 'SMALL',
        transitEncryptionEnabled: true,
        atRestEncryptionEnabled: true,
        ttl: 3600,
        healthMetricsConfig: 'ENABLED',
      });
    }

    // Create SQS queue
    const queue = new sqs.Queue(this, 'DvkFeedbackQueue', {
      queueName: `dvk-feedback-queue-${env}`,
      visibilityTimeout: Duration.seconds(60), // same as reader lambda
    });

    // Write SQS queue URL to SSM Parameter Store
    new ssm.StringParameter(this, 'DvkFeedbackQueueUrl', {
      parameterName: `/${env}/feedback-sqs-queue-url`,
      stringValue: queue.queueUrl,
    });

    // Create Lambda function to read from SQS
    this.createSqsReaderLambda(queue, env);

    const config = new Config(this);
    if (Config.isPermanentEnvironment()) {
      try {
        new WafConfig(this, 'DVK-WAF', api, Fn.split('\n', config.getStringParameter('WAFAllowedAddresses')));
      } catch (e) {
        // to keep SonarLint happy WafConfig created inside try catch
        console.log('WAF config failed: %s', e);
      }
    }
    // called so data migration can be made from old table to new table, otherwise old table is deleted
    this.createFairwayCardTable();
    const fairwayCardWithVersionsTable = this.createFairwayCardWithVersionsTable();
    this.createHarborTable();
    const harborWithVersionsTable = this.createHarborWithVersionsTable();

    const layer = LayerVersion.fromLayerVersionArn(
      this,
      'ParameterLayer',
      'arn:aws:lambda:eu-west-1:015030872274:layer:AWS-Parameters-and-Secrets-Lambda-Extension:11'
    );

    const fairwayCardVersioningBucket = this.createVersioningBucket('fairwaycard', env);
    const harborVersioningBucket = this.createVersioningBucket('harbor', env);

    const dbStreamHandler = new NodejsFunction(this, 'dbStreamHandler', {
      functionName: `db-stream-handler-${env}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: `${__dirname}/lambda/db/dynamoStreamHandler.ts`,
      environment: {
        FAIRWAYCARD_VERSIONING_BUCKET: fairwayCardVersioningBucket.bucketName,
        HARBOR_VERSIONING_BUCKET: harborVersioningBucket.bucketName,
        ENVIRONMENT: Config.getEnvironment(),
        LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
      },
      bundling: {
        minify: true,
      },
    });

    dbStreamHandler.addEventSource(
      new DynamoEventSource(fairwayCardWithVersionsTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );
    dbStreamHandler.addEventSource(
      new DynamoEventSource(harborWithVersionsTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    fairwayCardVersioningBucket.grantPut(dbStreamHandler);
    fairwayCardVersioningBucket.grantRead(dbStreamHandler);
    harborVersioningBucket.grantPut(dbStreamHandler);
    harborVersioningBucket.grantRead(dbStreamHandler);
    const cacheBucket = this.createCacheBucket(env);
    const staticBucket = this.createStaticBucket();
    staticBucket.grantDelete(dbStreamHandler);
    const vpc = Vpc.fromLookup(this, 'DvkVPC', { vpcName: this.getVPCName(env) });
    for (const lambdaFunc of lambdaFunctions) {
      const typeName = lambdaFunc.typeName;
      const fieldName = lambdaFunc.fieldName;
      const functionName = `${typeName}-${fieldName}-${env}`.toLocaleLowerCase();
      const backendLambda = new NodejsFunction(this, `GraphqlAPIHandler-${typeName}-${fieldName}-${env}`, {
        functionName,
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
        timeout: Duration.seconds(lambdaFunc.timeout ?? 30),
        memorySize: lambdaFunc.memorySize ?? 256,
        layers: [layer],
        vpc: lambdaFunc.useVpc ? vpc : undefined,
        environment: {
          FAIRWAY_CARD_TABLE: Config.getFairwayCardWithVersionsTableName(),
          HARBOR_TABLE: Config.getHarborWithVersionsTableName(),
          ENVIRONMENT: Config.getEnvironment(),
          LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
          TZ: 'Europe/Helsinki',
          PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: '2773',
          PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: Config.isDeveloperEnvironment() ? 'DEBUG' : 'WARN',
          SSM_PARAMETER_STORE_TTL: '300',
          CLOUDFRONT_DNSNAME: `${this.siteSubDomain}.${this.domainName}`,
          DAYS_TO_EXPIRE: Config.isDeveloperOrDevEnvironment() ? '1' : '30',
          API_TIMEOUT: '10000',
        },
        logGroup: new LogGroup(this, `LambdaLogs-${functionName}`, {
          logGroupName: `/dvk/lambda/${functionName}`,
          retention: Config.isPermanentEnvironment() ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        }),
        bundling: {
          minify: true,
        },
      });

      const lambdaDataSource = api.addLambdaDataSource(`lambdaDatasource_${typeName}_${fieldName}`, backendLambda);
      lambdaDataSource.createResolver(`${typeName}${fieldName}Resolver`, {
        typeName: typeName,
        fieldName: fieldName,
        cachingConfig:
          Config.isPermanentEnvironment() && lambdaFunc.useCaching
            ? { cachingKeys: ['$context.arguments'], ttl: cdk.Duration.minutes(60) }
            : undefined,
      });
      if (typeName === 'Mutation') {
        fairwayCardWithVersionsTable.grantReadWriteData(backendLambda);
        harborWithVersionsTable.grantReadWriteData(backendLambda);
        staticBucket.grantPut(backendLambda);
        // delete when more sophisticated caching is implemented
        // only needed to get updated starting and ending fairways for fairwaycard
        cacheBucket.grantDelete(backendLambda);
      } else {
        fairwayCardWithVersionsTable.grantReadData(backendLambda);
        harborWithVersionsTable.grantReadData(backendLambda);
      }
      cacheBucket.grantPut(backendLambda);
      cacheBucket.grantRead(backendLambda);
      staticBucket.grantRead(backendLambda);
      backendLambda.addToRolePolicy(new PolicyStatement({ effect: Effect.ALLOW, actions: ['ssm:GetParameter'], resources: ['*'] }));
      if (lambdaFunc.useSqs) queue.grantSendMessages(backendLambda);
    }
    Tags.of(fairwayCardWithVersionsTable).add('Backups-' + Config.getEnvironment(), 'true');
    Tags.of(harborWithVersionsTable).add('Backups-' + Config.getEnvironment(), 'true');
    const alb = this.createALB(env, fairwayCardWithVersionsTable, harborWithVersionsTable, cacheBucket, staticBucket, layer, vpc);
    try {
      new cdk.CfnOutput(this, 'LoadBalancerDnsName', {
        value: alb.loadBalancerDnsName || '',
        exportName: 'LoadBalancerDnsName' + env,
      });
      new cdk.CfnOutput(this, 'AppSyncAPIKey', {
        value: api.apiKey ?? '',
        exportName: 'AppSyncAPIKey' + env,
      });
      new cdk.CfnOutput(this, 'AppSyncAPIURL', {
        value: api.graphqlUrl ?? '',
        exportName: 'AppSyncAPIURL' + env,
      });
    } catch (e) {
      // to keep SonarLint happy CfnOutput created inside try catch
      console.log('CloudFormation output failed: %s', e);
    }
  }

  private addDevelopmentLambdas(httpListener: ApplicationListener, env: string, staticBucket: Bucket) {
    let functionName = `cors-${env}`.toLocaleLowerCase();
    const corsLambda = new NodejsFunction(this, `APIHandler-CORS-${env}`, {
      functionName,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, 'lambda/api/cors-handler.ts'),
      handler: 'handler',
      environment: {
        LOG_LEVEL: 'debug',
      },
      // logRetention: RetentionDays.ONE_DAY,
      logGroup: new LogGroup(this, `LambdaLogs-${functionName}`, {
        logGroupName: `/dvk/lambda/${functionName}`,
        retention: RetentionDays.ONE_DAY,
      }),
      bundling: {
        minify: true,
      },
    });
    httpListener.addTargets('HTTPListenerTarget-CORS', {
      targets: [new LambdaTarget(corsLambda)],
      priority: 1,
      conditions: [ListenerCondition.httpRequestMethods(['OPTIONS'])],
    });
    functionName = `image-${env}`.toLocaleLowerCase();
    const imgLambda = new NodejsFunction(this, `APIHandler-Image-${env}`, {
      functionName,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, 'lambda/api/image-handler.ts'),
      handler: 'handler',
      environment: {
        LOG_LEVEL: 'debug',
        ENVIRONMENT: env,
      },
      // logRetention: RetentionDays.ONE_DAY,
      logGroup: new LogGroup(this, `LambdaLogs-${functionName}`, {
        logGroupName: `/dvk/lambda/${functionName}`,
        retention: RetentionDays.ONE_DAY,
      }),
      bundling: {
        minify: true,
      },
    });
    httpListener.addTargets('HTTPListenerTarget-Image', {
      targets: [new LambdaTarget(imgLambda)],
      priority: 2,
      conditions: [ListenerCondition.pathPatterns(['/api/image'])],
    });
    staticBucket.grantRead(imgLambda);
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
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'expires',
    });
    table.addGlobalSecondaryIndex({
      indexName: 'FairwayCardByFairwayIdIndex',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      projectionType: ProjectionType.KEYS_ONLY,
      sortKey: { name: 'fairwayIds', type: AttributeType.STRING },
    });
    return table;
  }

  private createFairwayCardWithVersionsTable(): Table {
    const table = new Table(this, 'FairwayCardTableWithVersions', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: Config.getFairwayCardWithVersionsTableName(),
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'version',
        type: AttributeType.STRING,
      },
      pointInTimeRecovery: true,
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'expires',
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
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'expires',
    });
  }

  private createHarborWithVersionsTable(): Table {
    return new Table(this, 'HarborTableWithVersions', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: Config.getHarborWithVersionsTableName(),
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'version',
        type: AttributeType.STRING,
      },
      pointInTimeRecovery: true,
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'expires',
    });
  }

  private createApiKeyExpiration() {
    const now = new Date();
    now.setDate(now.getDate() + 365);
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
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

  private createStaticBucket() {
    const s3DeletePolicy: Pick<BucketProps, 'removalPolicy' | 'autoDeleteObjects'> = {
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: Config.isPermanentEnvironment() ? undefined : true,
    };
    const staticBucket = new Bucket(this, 'NewStaticBucket', {
      bucketName: getNewStaticBucketName(),
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      ...s3DeletePolicy,
      lifecycleRules: [{ tagFilters: { InUse: 'false' }, expiration: Config.isPermanentEnvironment() ? Duration.days(30) : Duration.days(1) }],
    });
    const cloudfrontOAI = new OriginAccessIdentity(this, 'StaticCloudfrontOAI', {
      comment: `Static OAI for ${Config.getEnvironment()}`,
    });
    new cdk.CfnOutput(this, 'StaticOAI', {
      value: cloudfrontOAI.originAccessIdentityId,
      description: 'OriginAccessIdentityId for static bucket',
      exportName: `OriginAccessIdentityId${Config.getEnvironment()}`,
    });
    staticBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [staticBucket.arnForObjects('*')],
        principals: [new CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    Tags.of(staticBucket).add('Backups-' + Config.getEnvironment(), 'true');
    return staticBucket;
  }

  private createVersioningBucket(table: string, env: string): Bucket {
    const duration = Config.isPermanentEnvironment() ? Duration.days(30) : Duration.days(1);
    const numberOfVersionsToKeep = Config.isPermanentEnvironment() ? 5 : 1; // how many versions to keep at expiration point

    const lifecycleRules: LifecycleRule[] = [
      {
        noncurrentVersionExpiration: duration,
        noncurrentVersionsToRetain: numberOfVersionsToKeep,
      },
    ];

    const s3DeletePolicy: Pick<BucketProps, 'removalPolicy' | 'autoDeleteObjects'> = {
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: Config.isPermanentEnvironment() ? undefined : true,
    };
    return new Bucket(this, table + 'VersioningBucket', {
      bucketName: `${table}-versioning-${env}`,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      ...s3DeletePolicy,
      lifecycleRules,
    });
  }

  private createALB(
    env: string,
    fairwayCardTable: Table,
    harborTable: Table,
    cacheBucket: Bucket,
    staticBucket: Bucket,
    layer: ILayerVersion,
    vpc: IVpc
  ): ApplicationLoadBalancer {
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
    if (!Config.isPermanentEnvironment()) {
      this.addDevelopmentLambdas(httpListener, env, staticBucket);
    }
    for (const lambdaFunc of apiLambdaFunctions) {
      const lambdaName = lambdaFunc.functionName;
      const functionName = `${lambdaName}-${env}`.toLocaleLowerCase();
      const backendLambda = new NodejsFunction(this, `APIHandler-${lambdaName}-${env}`, {
        functionName,
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
        layers: [layer],
        timeout: Duration.seconds(lambdaFunc.timeout ?? 60),
        memorySize: lambdaFunc.memorySize ?? 256,
        vpc: lambdaFunc.useVpc ? vpc : undefined,
        environment: {
          LOG_LEVEL: Config.isPermanentEnvironment() ? 'info' : 'debug',
          ENVIRONMENT: Config.getEnvironment(),
          FAIRWAY_CARD_TABLE: Config.getFairwayCardWithVersionsTableName(),
          HARBOR_TABLE: Config.getHarborWithVersionsTableName(),
          TZ: 'Europe/Helsinki',
          PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: '2773',
          PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: Config.isDeveloperEnvironment() ? 'DEBUG' : 'WARN',
          SSM_PARAMETER_STORE_TTL: '300',
          CLOUDFRONT_DNSNAME: `${this.siteSubDomain}.${this.domainName}`,
          API_TIMEOUT: '10000',
        },
        // logRetention: Config.isPermanentEnvironment() ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        logGroup: new LogGroup(this, `LambdaLogs-${lambdaName}`, {
          logGroupName: `/dvk/lambda/${functionName}`,
          retention: Config.isPermanentEnvironment() ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        }),
        bundling: {
          minify: true,
        },
      });
      const target = httpListener.addTargets(`HTTPListenerTarget-${lambdaName}`, {
        targets: [new LambdaTarget(backendLambda)],
        priority: lambdaFunc.priority,
        conditions: [ListenerCondition.pathPatterns([lambdaFunc.pathPattern])],
      });
      target.setAttribute('lambda.multi_value_headers.enabled', 'true');
      fairwayCardTable.grantReadData(backendLambda);
      harborTable.grantReadData(backendLambda);
      cacheBucket.grantPut(backendLambda);
      cacheBucket.grantRead(backendLambda);
      staticBucket.grantRead(backendLambda);
      backendLambda.addToRolePolicy(new PolicyStatement({ effect: Effect.ALLOW, actions: ['ssm:GetParameter'], resources: ['*'] }));
    }
    return alb;
  }

  private getVPCName(env: string): string {
    if (env === 'dev') {
      return 'DvkDev-VPC';
    } else if (env === 'test' || env === 'feature') {
      return 'DvkTest-VPC';
    } else if (env === 'prod') {
      return 'DVKProd-VPC';
    } else {
      return 'DvkDev-VPC';
    }
  }

  private createSqsReaderLambda(queue: sqs.Queue, env: string): lambda.Function {
    const sqsReaderLambda = new NodejsFunction(this, 'DvkSqsReaderLambda', {
      functionName: `dvk-feedback-reader-${env}`,
      entry: path.join(__dirname, 'lambda', 'sqsReader.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
      memorySize: 256,
      timeout: Duration.seconds(60),
    });

    // Grant the Lambda function permission to read from the SQS queue
    queue.grantConsumeMessages(sqsReaderLambda);

    // Add SQS as an event source for the Lambda function
    sqsReaderLambda.addEventSource(new SqsEventSource(queue));

    return sqsReaderLambda;
  }
}

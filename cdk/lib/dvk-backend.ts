import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { FieldLogLevel } from '@aws-cdk/aws-appsync-alpha';

export class DvkBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, env: string) {
    super(scope, id, props);
    const backendLambda = new NodejsFunction(this, 'GraphqlAPIHandler' + env, {
      functionName: 'dvk-graphql-backend-' + env,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: 'lib/lambda/api-handler.ts',
      handler: 'handleEvent',
    });
    backendLambda.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLambdaInsightsExecutionRolePolicy'));
    const api = new appsync.GraphqlApi(this, 'DVKGraphqlApi', {
      name: 'dvk-graphql-api-' + env,
      schema: appsync.Schema.fromAsset('schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        excludeVerboseContent: true,
      },
      xrayEnabled: true,
    });
    const lambdaDataSource = api.addLambdaDataSource('lambdaDatasource', backendLambda);
    lambdaDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'fairways',
    });
    new cdk.CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
    });
    new cdk.CfnOutput(this, 'AppSyncAPIURL', {
      value: api.graphqlUrl || '',
    });
  }
}

import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { FieldLogLevel } from '@aws-cdk/aws-appsync-alpha';
import * as path from 'path';
import lambdaFunctions from './lambda/graphql/lambdaFunctions';

export class DvkBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, env: string) {
    super(scope, id, props);
    const api = new appsync.GraphqlApi(this, 'DVKGraphqlApi', {
      name: 'dvk-graphql-api-' + env,
      schema: appsync.Schema.fromAsset(path.join(__dirname, '../graphql/schema.graphql')),
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
    for (const lambdaFunc of lambdaFunctions) {
      console.log(lambdaFunc.entry);
      const backendLambda = new NodejsFunction(this, `GraphqlAPIHandler-${lambdaFunc.typeName}-${lambdaFunc.functionName}-${env}`, {
        functionName: `${lambdaFunc.typeName}-${lambdaFunc.functionName}-${env}`,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
      });
      const lambdaDataSource = api.addLambdaDataSource(`lambdaDatasource-${lambdaFunc.functionName}`, backendLambda);
      lambdaDataSource.createResolver({
        typeName: lambdaFunc.typeName,
        fieldName: lambdaFunc.functionName,
      });
    }
    new cdk.CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
    });
    new cdk.CfnOutput(this, 'AppSyncAPIURL', {
      value: api.graphqlUrl || '',
    });
  }
}

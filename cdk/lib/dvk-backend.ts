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
      const typeName = lambdaFunc.typeName || this.parseTypeName(lambdaFunc.entry);
      const fieldName = lambdaFunc.functionName || this.parseFieldName(lambdaFunc.entry);
      const backendLambda = new NodejsFunction(this, `GraphqlAPIHandler-${typeName}-${fieldName}-${env}`, {
        functionName: `${typeName}-${fieldName}-${env}`.toLocaleLowerCase(),
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: lambdaFunc.entry,
        handler: 'handler',
      });
      const lambdaDataSource = api.addLambdaDataSource(`lambdaDatasource-${fieldName}`, backendLambda);
      lambdaDataSource.createResolver({
        typeName: typeName,
        fieldName: fieldName,
      });
    }
    new cdk.CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
    });
    new cdk.CfnOutput(this, 'AppSyncAPIURL', {
      value: api.graphqlUrl || '',
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
}

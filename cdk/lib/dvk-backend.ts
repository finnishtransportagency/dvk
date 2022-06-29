import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export class DvkBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, env: string) {
    super(scope, id, props);
    const backendLambda = new NodejsFunction(this, 'APIHandler' + env, {
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: 'lib/lambda/api-handler.ts',
      handler: 'handleEvent',
    });
    backendLambda.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLambdaInsightsExecutionRolePolicy'));
  }
}

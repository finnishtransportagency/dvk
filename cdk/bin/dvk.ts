#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DvkBuildImageStack } from '../lib/dvk-build-image-stack';
import { App, StackProps } from 'aws-cdk-lib';
import { PipelineLambda } from '../lib/pipeline-lambda';
import Config from '../lib/config';
import { DvkPipeline } from '../lib/dvk-pipeline';
import { DvkBackendStack } from '../lib/dvk-backend';

async function main() {
  class DvkPipelineLambdaStack extends cdk.Stack {
    constructor(parent: App, id: string, props: StackProps) {
      super(parent, id, props);

      new PipelineLambda(this, 'DvkPipelineLambda');
    }
  }

  class DvkPipelineStack extends cdk.Stack {
    constructor(parent: App, id: string, props: StackProps, env: string) {
      super(parent, id, props);

      new DvkPipeline(this, 'DvkPipeline', { env });
    }
  }

  const app = new cdk.App();

  new DvkBuildImageStack(app, 'DvkBuildImageStack', {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    stackName: 'DvkBuildImageStack',
  });

  new DvkPipelineLambdaStack(app, 'DvkPipelineLambdaStack', {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    stackName: 'DvkPipelineLambdaStack',
  });

  const appEnv = Config.getEnvironment();
  console.log('app environment:', appEnv);

  new DvkPipelineStack(
    app,
    'DvkPipelineStack',
    {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'eu-west-1',
      },
      stackName: 'DvkPipelineStack-' + appEnv,
    },
    appEnv
  );

  const backend = new DvkBackendStack(
    app,
    'DvkBackendStack',
    {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'eu-west-1',
      },
      stackName: 'DvkBackendStack-' + appEnv,
    },
    appEnv
  );
  await backend.process();
}

main().catch((e) => {
  console.log('Deployment of DVK failed:', e);
  process.exit(1);
});

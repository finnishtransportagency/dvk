#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DvkBuildImageStack } from '../lib/dvk-build-image-stack';
import { App, StackProps } from 'aws-cdk-lib';
import { PipelineLambda } from '../lib/pipeline-lambda';
import Config from '../lib/config';
import { DvkPipeline } from '../lib/dvk-pipeline';
import { DvkBackendStack } from '../lib/dvk-backend';
import { DvkFeaturePipelineStack } from '../lib/dvk-feature-pipeline';
import { DvkSonarPipelineStack } from '../lib/dvk-sonar-pipeline';
import { PipelineMessaging } from '../lib/pipeline-messaging';
import { SquatSite } from '../lib/squat-site';
import { SquatPipeline } from '../lib/squat-pipeline';

class DvkPipelineMessagingStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new PipelineMessaging(this, 'DvkPipelineMessaging');
  }
}
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

class SquatSiteStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps, env: string) {
    super(parent, id, props);
    const cloudfrontCertificateArn = Config.isPermanentEnvironment() ? new Config(this).getStringParameter('CloudFrontCertificateArn') : undefined;
    new SquatSite(this, 'SquatSite', {
      domainName: env === 'prod' ? 'vaylapilvi.fi' : 'testivaylapilvi.fi',
      siteSubDomain: env === 'prod' ? 'dvk' : 'dvk' + env,
      env,
      cloudfrontCertificateArn,
    });
  }
}
class SquatPipelineStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps, env: string) {
    super(parent, id, props);

    new SquatPipeline(this, 'SquatPipeline', { env });
  }
}

const app = new cdk.App();

new DvkBuildImageStack(app, 'DvkBuildImageStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'DvkBuildImageStack',
  tags: Config.tags,
});

new DvkPipelineLambdaStack(app, 'DvkPipelineLambdaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'DvkPipelineLambdaStack',
  tags: Config.tags,
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
    tags: Config.tags,
  },
  appEnv
);

new DvkBackendStack(
  app,
  'DvkBackendStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'eu-west-1',
    },
    stackName: 'DvkBackendStack-' + appEnv,
    tags: Config.tags,
  },
  appEnv
);

new DvkFeaturePipelineStack(app, 'DvkFeaturePipelineStack');

new DvkSonarPipelineStack(app, 'DvkSonarPipelineStack');
new DvkPipelineMessagingStack(app, 'DvkPipelineMessagingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'DvkPipelineMessagingStack',
  tags: Config.tags,
});

new SquatSiteStack(
  app,
  'SquatSiteStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'eu-west-1',
    },
    stackName: 'SquatSiteStack-' + appEnv,
    tags: Config.tags,
  },
  appEnv
);

new SquatPipelineStack(
  app,
  'SquatPipelineStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'eu-west-1',
    },
    stackName: 'SquatPipelineStack-' + appEnv,
    tags: Config.tags,
  },
  appEnv
);

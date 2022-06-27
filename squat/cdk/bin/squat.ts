#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SquatSite } from '../lib/squat-site';
import { App, StackProps } from 'aws-cdk-lib';
import { SquatPipeline } from '../lib/squat-pipeline';
import Config from '../lib/config';

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

/* get the user set application environment */
const appEnv = Config.getEnvironment();
console.log('app environment:', appEnv);

const app = new cdk.App();

new SquatSiteStack(
  app,
  'SquatSiteStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'eu-west-1',
    },
    stackName: 'SquatSiteStack-' + appEnv,
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
  },
  appEnv
);

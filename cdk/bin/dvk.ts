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
import { BackupServices } from '../lib/dvk-backup-services';
import { MonitoringServices } from '../lib/dvk-monitoring';
import { DvkUsEast } from '../lib/dvk-us-east';
import { AdminPipeline } from '../lib/admin-pipeline';
import { DvkScheduledTestsPipelineStack } from '../lib/dvk-scheduled-tests-pipeline';
import { DvkAnalyticsStack } from '../lib/dvk-analytics-stack';
import { PreviewPipeline } from '../lib/preview-pipeline';
import { PipelineLambdaVpc } from '../lib/pipeline-lambda-vpc';

class DvkUsEastStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new DvkUsEast(this, 'DvkUsEastResources');
  }
}
class DvkMonitoringServicesStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new MonitoringServices(this, 'DvkMonitoringServices');
  }
}
class DvkBackupServicesStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new BackupServices(this, 'DvkBackupServices');
  }
}
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

class DvkPipelineLambdaVpcStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new PipelineLambdaVpc(this, 'DvkPipelineVpcLambda');
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

new DvkPipelineLambdaStack(app, 'DvkPipelineLambdaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'DvkPipelineLambdaStack',
  tags: Config.tags,
});

new DvkPipelineLambdaVpcStack(app, 'DvkPipelineLambdaVpcStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'DvkPipelineLambdaVpcStack',
  tags: Config.tags,
});

const appEnv = Config.getEnvironment();
console.log('app environment:', appEnv);

new DvkBuildImageStack(
  app,
  'DvkBuildImageStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    stackName: 'DvkBuildImageStack',
    tags: Config.tags,
  },
  appEnv
);

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

new DvkScheduledTestsPipelineStack(app, 'DvkScheduledTestsPipelineStack');

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

new DvkBackupServicesStack(app, 'DvkBackupServicesStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'DvkBackupServicesStack-' + appEnv,
  tags: Config.tags,
});

new DvkMonitoringServicesStack(app, 'DvkMonitoringStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'DvkMonitoringServicesStack-' + appEnv,
  tags: Config.tags,
});

new DvkAnalyticsStack(
  app,
  'DvkAnalyticsStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    stackName: 'DvkAnalyticsStack-' + appEnv,
    tags: Config.tags,
  },
  appEnv
);

new DvkUsEastStack(app, 'DvkUsEastStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  stackName: 'DvkUsEastStack-' + appEnv,
  tags: Config.tags,
});

class AdminPipelineStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps, env: string) {
    super(parent, id, props);

    new AdminPipeline(this, 'AdminPipeline', { env });
  }
}

new AdminPipelineStack(
  app,
  'AdminPipelineStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'eu-west-1',
    },
    stackName: 'AdminPipelineStack-' + appEnv,
    tags: Config.tags,
  },
  appEnv
);

class PreviewPipelineStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps, env: string) {
    super(parent, id, props);

    new PreviewPipeline(this, 'PreviewPipeline', { env });
  }
}

new PreviewPipelineStack(
  app,
  'PreviewPipelineStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'eu-west-1',
    },
    stackName: 'PreviewPipelineStack-' + appEnv,
    tags: Config.tags,
  },
  appEnv
);
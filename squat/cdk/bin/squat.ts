#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SquatSite } from "../lib/squat-site";
import { App, StackProps } from "aws-cdk-lib";
import { SquatPipeline } from "../lib/squat-pipeline";

class SquatSiteStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new SquatSite(this, "SquatSite", { domainName: "testivaylapilvi.fi", siteSubDomain: "dvkdev2" });
  }
}
class SquatPipelineStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new SquatPipeline(this, "SquatPipeline", { env: "dev" });
  }
}

const app = new cdk.App();

new SquatSiteStack(app, "SquatSiteStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "eu-west-1",
  },
});

new SquatPipelineStack(app, "SquatPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "eu-west-1",
  },
});

#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SquatSite } from "../lib/squat-site";
import { App, StackProps } from "aws-cdk-lib";

class SquatSiteStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new SquatSite(this, "SquatSite", { domainName: "testivaylapilvi.fi", siteSubDomain: "dvkdev" });
  }
}
const app = new cdk.App();

new SquatSiteStack(app, "SquatSiteStack", {
  env: {
    // account: 
    region: "eu-west-1",
  }
})

#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DvkBuildImageStack } from "../lib/dvk-build-image-stack";
import { App, StackProps } from "aws-cdk-lib";
import { PipelineLambda } from "../lib/pipline-lambda";

class DvkPipelineLambdaStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new PipelineLambda(this, "DvkPipelineLambda");
  }
}

const app = new cdk.App();

new DvkBuildImageStack(app, "DvkBuildImageStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: "DvkBuildImageStack",
});

new DvkPipelineLambdaStack(app, "DvkPipelineLambdaStack", {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  stackName: "DvkPiplineLambdaStack",
});

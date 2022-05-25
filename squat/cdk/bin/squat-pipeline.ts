#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { App, StackProps } from "aws-cdk-lib";
import { SquatPipeline } from "../lib/squat-pipeline";

class SquatPipelineStack extends cdk.Stack {
  constructor(parent: App, id: string, props: StackProps) {
    super(parent, id, props);

    new SquatPipeline(this, "SquatPipeline", { env: "dev" });
  }
}
const app = new cdk.App();

new SquatPipelineStack(app, "SquatPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "eu-west-1",
  },
});

// async function main() {
//   const app = new cdk.App();
//   // tslint:disable-next-line:no-unused-expression
//   new SquatPipelineStack(app, "SquatPipelineStack", {
//     env: {
//       // account:
//       /**
//        * Stack must be in us-east-1, because the ACM certificate for a
//        * global CloudFront distribution must be requested in us-east-1.
//        * TODO: siirra irlantiin kun saadaan sertifikaatti vaylapilvelta
//        */
//       region: "eu-west-1",
//     },
//   });
//   app.synth();
// }

// main();

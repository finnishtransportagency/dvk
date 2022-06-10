#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DvkBuildImageStack } from '../lib/dvk-build-image-stack';

const app = new cdk.App();
new DvkBuildImageStack(app, 'DvkBuildImageStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION },
    stackName: 'DvkBuildImageStack',
});
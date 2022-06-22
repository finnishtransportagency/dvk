# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Installing stacks

Login to AWS account using `aws sso login` command. Setup your AWS_PROFILE environment variable to correspond your login credentials.
Run `npm run postlogin` to synchonize CDK credentials.

Setup environment variable ENVIRONMENT to correspond your installing target.
## Useful commands

* `npm run login`   AWS SSO login and CDK credential synchronization
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

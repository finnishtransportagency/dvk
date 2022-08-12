# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Deploying stacks

Login to AWS account using `aws sso login` command. Setup your AWS_PROFILE environment variable to correspond your login credentials.
Run `npm run postlogin` to synchonize CDK credentials.

Setup environment variable ENVIRONMENT to correspond your installing target. You can list available stacks using `cdk ls` command.
There is also predefined deploy commands configured for npm run scripts.

Run `npm run setup` to write .env.local file for local development.

## Useful commands

* `npm run login`     AWS SSO login and CDK credential synchronization
* `npm run build`     compile typescript to js
* `npm run watch`     watch for changes and compile
* `npm run test`      perform the jest unit tests
* `npm run setup`     write local environment variables to .env.local file
* `npm run datasync`  update DynammoDB table and S3 GeoTIFF bucket data to specified environment (ENVIRONMENT variable)
* `cdk deploy`        deploy this stack to your default AWS account/region
* `cdk diff`          compare deployed stack with current state
* `cdk synth`         emits the synthesized CloudFormation template

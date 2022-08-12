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

* `npm run login`   AWS SSO login and CDK credential synchronization
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run setup`       write local environment variables to .env.local file
* `npm run datasync`    update DynammoDB table and S3 GeoTIFF bucket data to specified environment (ENVIRONMENT variable)
* `npm run cdk ls`      list all stacks on your default AWS account/region
* `npm run cdk deploy`  deploy this stack to your default AWS account/region
* `npm run cdk diff`    compare deployed stack with current state
* `npm run cdk synth`   emits the synthesized CloudFormation template

## Environment variables
To set environment variables you can use following command where myenv is your environment name.
```
. ./bin/setenv.sh myenv
```
### Permanent environments
| Environment name | Description |
| ----------- | ----------- |
| dev | Development environment
| test | Testing environment
| prod | Production environment

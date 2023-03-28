# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.
The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Deploying stacks

Setup your AWS_PROFILE environment variable to correspond your login credentials. Login to AWS account using `npm run login` command.

Setup environment variables using [./bin/setenv.sh](./bin/setenv.sh) script. You can list available stacks using `npm run cdk ls` command.
There is also predefined deploy commands configured for [npm run scripts](#useful-commands).

Run `npm run setup` to write [.env.local](../.env.local) file for local development.

Bundling of lambda function uses [esbuild](https://esbuild.github.io).
## Useful commands

* `npm run login`   AWS SSO login and CDK credential synchronization
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run setup`       write local environment variables to .env.local file
* `npm run datasync`    update DynammoDB table and S3 GeoTIFF bucket data to specified environment (ENVIRONMENT variable)
* `npm run generate`    generate types from GraphQL schema
* `npm run cdk ls`      list all stacks on your default AWS account/region
* `npm run cdk deploy`  deploy this stack to your default AWS account/region
* `npm run cdk diff`    compare deployed stack with current state
* `npm run cdk synth`   emits the synthesized CloudFormation template
* `npm run deploy:backend`          deploy backend stack
* `npm run deploy:backend:hostswap` deploy backend stack assets only (lambda)
* `npm run deploy:frontend`         deploy frontend stack

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

## Quick setup
Commands for installing own environment to AWS. Just replace myenv and your_aws_profile with your environment name and AWS profile name.
```
npm install
npm run generate
export AWS_PROFILE=your_aws_profile
npm run login
. ./bin/setenv.sh myenv
npm run deploy:backend
// optional since only backend stack is mandatory for local development
npm run deploy:frontend
npm run setup
npm run datasync
```

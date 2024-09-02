# Playwright tests

## Installation
- npm ci
- npx playwright install --with-deps

## Running tests
### Locally
```
# headless
npx playwright test
# head
npx playwright test --headed
# ui incl for debugging, locator picker etc
npx playwright test --ui
```
### Using docker
Based on docker image https://mcr.microsoft.com/en-us/product/playwright/about. You can find more instructions there.
Use [setenv.sh](../cdk/bin/setenv.sh) script to set environment variables.
```
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com
docker pull $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/dvk-playwrightimage:1.0.0
# DVK tests
docker run --rm -v `pwd`:/e2e:Z --ipc=host $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/dvk-playwrightimage:1.0.0
```
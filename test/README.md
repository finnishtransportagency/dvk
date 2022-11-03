# Robot Framework tests

## Requirements
- Python 3
- Chromedriver
- Chrome

## Installation
- pip install -r requirements.txt

## Running tests
### Locally
```
# uses headless chrome
robot .
# uses browser specified as variable, in this case chrome
robot -v BROWSER:chrome .
```
### Using docker
Based on docker image https://github.com/ppodgorsek/docker-robot-framework. You can find more instructions there.
```
export AWS_ACCOUNT_ID=xxx
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com
docker pull $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/dvk-robotimage:1.0.0
docker run --rm -v `pwd`:/opt/robotframework/reports:Z -v `pwd`:/opt/robotframework/tests:Z -e ROBOT_OPTIONS="-v BROWSER:chrome" --network host $AWS_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/dvk-robotimage:1.0.0
```
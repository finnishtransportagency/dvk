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
robot -v BROWSER:chrome .
```
### Using docker
Based on docker image https://github.com/ppodgorsek/docker-robot-framework. You can find more instructions there.
```
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 012525309247.dkr.ecr.eu-west-1.amazonaws.com
docker pull 012525309247.dkr.ecr.eu-west-1.amazonaws.com/dvk-robotimage:1.0.0
docker run --rm -v `pwd`:/opt/robotframework/reports:Z -v `pwd`:/opt/robotframework/tests:Z -e BROWSER=chrome --network host 012525309247.dkr.ecr.eu-west-1.amazonaws.com/dvk-robotimage:1.0.0
```
#!/bin/bash
REPO=012525309247.dkr.ecr.eu-west-1.amazonaws.com
BUILD_IMAGE_VERSION=1.0.0
IMAGE=dvk-buildimage
REPO_TAG=$REPO/$IMAGE:$BUILD_IMAGE_VERSION
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $REPO
aws ecr create-repository --repository-name $IMAGE > /dev/null 2>&1
docker pull $REPO_TAG > /dev/null 2>&1
docker build --progress=plain --cache-from $REPO_TAG -t $IMAGE:$BUILD_IMAGE_VERSION ../../ && docker tag $IMAGE:$BUILD_IMAGE_VERSION $REPO_TAG
if [ "$1" = "--push" ] 
then
  docker push $REPO_TAG
fi

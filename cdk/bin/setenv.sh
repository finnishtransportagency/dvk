#!/usr/bin/env bash
if [ -z $1 ]
then
  echo "Usage: . ./bin/setenv.sh [environment name]"
  echo "Parameters:"
  echo "  environment name - name of AWS environment, for example dev"
else
  export ENVIRONMENT=$1
  export NODE_OPTIONS="--max_old_space_size=4096 --max-old-space-size=4096"
  export AWS_DEFAULT_REGION=eu-west-1
  echo "Following environment variables set:"
  echo "export ENVIRONMENT=$1"
  echo "export NODE_OPTIONS=\"$NODE_OPTIONS\""
  echo "export AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"
  if [ ! -z $AWS_PROFILE ]
  then
    export AWS_ACCOUNT_ID=`echo $AWS_PROFILE | sed "s/[^0-9]//g"`
    echo "export AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID"
  fi
fi

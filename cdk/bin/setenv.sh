#!/usr/bin/env bash
if [ -z $1 ]
then
  echo "Usage: . ./bin/setenv.sh [environment name]"
  echo "Parameters:"
  echo "  environment name - name of AWS environment, for example dev"
else
  export ENVIRONMENT=$1
  export PUBLIC_IP=`npm run -s ip`
  echo "Following environment variables set:"
  echo "export ENVIRONMENT=$1"
  echo "export PUBLIC_IP=$PUBLIC_IP"
fi

#!/usr/bin/env bash
if [ -z $ENVIRONMENT ]
then
  echo "Environment variable ENVIRONMENT missing. Use setenv.sh script to set it."
else
    PORT=${PORT:-8080}
    ALB=`aws cloudformation list-exports --output json 2> /dev/null | grep DvkALB-$ENVIRONMENT | awk -F \" '{print $4}'`
    if [ "$ALB" != "" ]
    then
        aws ssm start-session --target i-0cbddb944359c553d --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters "host=$ALB,portNumber"=["80"],"localPortNumber"=["$PORT"] > /dev/null &
        echo "Port forwarding to $ALB started on port $PORT"
    else
        echo "Make sure you have logged in your aws account or environment $ENVIRONMENT exists."
    fi
fi

#!/usr/bin/env bash
aws ssm start-session --target i-0cbddb944359c553d --document-name AWS-StartPortForwardingSession --parameters "portNumber"=["22"],"localPortNumber"=["9999"] > /dev/null &
sleep 5
ssh dvk /home/ec2-user/uptime.sh > /dev/null 2>&1

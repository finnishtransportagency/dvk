#!/usr/bin/env bash
if [ -z "$1" ] || [ -z $ENVIRONMENT ]; then
    echo "Missing stack name or environment variable ENVIRONMENT. Give stack name as agument ie. 'setstackpolicy.sh DvkBackendStack' and use setenv.sh script to set ENVIRONMENT variable."
else

    case "$ENVIRONMENT" in
    *dev* | *test* | *prod*)
        POLICYFILE="./bin/data/prevent-update-stack-policy.json"
        ;;
    *)
        POLICYFILE="./bin/data/allow-all-stack-policy.json"
        ;;
    esac

    STACKNAME="$1-$ENVIRONMENT"
    echo "Setting stack policy"
    echo "aws cloudformation set-stack-policy --stack-name $STACKNAME --stack-policy-body file://$POLICYFILE"
    $(aws cloudformation set-stack-policy --stack-name $STACKNAME --stack-policy-body file://$POLICYFILE)

    if [ $? -ne 0 ]; then
        echo "Could not set the stack policy"
    else
        echo "Stack policy on $STACKNAME has been set"
    fi
fi

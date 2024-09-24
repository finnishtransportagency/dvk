#!/usr/bin/env bash

if [ -z "$LOG_BUCKET" ]; then
    echo "LOG_BUCKET environment variable is not set. Please set it before running this script."
    exit 1
fi

if [ -z "$CF_DISTRIBUTION" ]; then
    echo "CF_DISTRIBUTION environment variable is not set. Please set it before running this script."
    exit 1
fi

#Log filenames start with distribution id.year.month eg. E2GP14WC00IGAB.2023-11-
s3_prefix="$CF_DISTRIBUTION.$(date +'%Y-%m')-*"

mkdir cflogs

echo "aws s3 cp "s3://$LOG_BUCKET" /analytics/cflogs/ --exclude "*" --include $s3_prefix --recursive"
aws s3 cp "s3://$LOG_BUCKET" /analytics/cflogs/ --exclude "*" --include $s3_prefix --recursive

if [ $? -ne 0 ]; then
    echo "Could not download files from s3"
    exit 1
else
    echo "File download ready"
fi

echo "Creating report"
gunzip -c /analytics/cflogs/*.gz | goaccess -a -o /analytics/report.html --std-geoip --anonymize-ip --ignore-crawlers --unknowns-as-crawlers --time-format=%H:%M:%S --date-format=%Y-%m-%d --log-format=CLOUDFRONT -
if [ $? -ne 0 ]; then
    echo "Error creating report"
    exit 1
else
    echo "Report ready"
fi

year_number=$(date +'%Y')
month_number=$(date +'%m')
#if environment variable REPORT_BUCKET exists
if [ -z "$REPORT_BUCKET" ]; then
    echo "REPORT_BUCKET environment variable is not set. Skipping report upload."
    exit 0
else
    echo "Uploading /analytics/report to S3"
    aws s3 cp /analytics/report.html s3://$REPORT_BUCKET/reports/$year_number/$month_number/
    if [ $? -ne 0 ]; then
        echo "Error uploading report"
        exit 1
    else
        echo "Report uploaded"
        echo "Report URL: https://$REPORT_BUCKET.s3.amazonaws.com/reports/$year_number/$month_number/report.html"
        exit 0
    fi
fi

#!/usr/bin/env bash

if [ -z "$LOG_BUCKET" ]; then
    echo "LOG_BUCKET environment variable is not set. Please set it before running this script."
    exit 1
fi

if [ -z "$CF_DISTRIBUTION" ]; then
    echo "CF_DISTRIBUTION environment variable is not set. Please set it before running this script."
    exit 1
fi

# CLoudfront access log filenames start with distributionid.year-month eg. E2GP14WC00IGAB.2023-11-

# Get the current year and month
CURRENT_YEAR=$(date +'%Y')
CURRENT_MONTH=$(date +'%m')

# Check if REPORT_YEAR and REPORT_MONTH environment variables exist
if [ -n "$REPORT_YEAR" ] && [ -n "$REPORT_MONTH" ]; then
    echo "Using REPORT_YEAR and REPORT_MONTH environment variables."
else
    echo "REPORT_YEAR and REPORT_MONTH environment variables not set. Using current year and month."
    REPORT_YEAR=$CURRENT_YEAR
    REPORT_MONTH=$CURRENT_MONTH
fi

# Construct the S3 prefix
s3_prefix="$CF_DISTRIBUTION.$REPORT_YEAR-$REPORT_MONTH-*"
echo "S3 prefix: $s3_prefix"

# Check if analytics/cflogs directory exists, if not create it
if [ ! -d "analytics/cflogs" ]; then
    echo "Creating cflogs directory"
    mkdir analytics/cflogs
    if [ $? -ne 0 ]; then
        echo "Error creating analytics/cflogs directory"
        exit 1
    fi
else
    # Remove all files from cflogs directory
    echo "Removing all files from cflogs directory"
    rm -rf analytics/cflogs/*
    if [ $? -ne 0 ]; then
        echo "Error removing files from analytics/cflogs directory"
        exit 1
    fi
fi

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


#if environment variable REPORT_BUCKET exists
if [ -z "$REPORT_BUCKET" ]; then
    echo "REPORT_BUCKET environment variable is not set. Skipping report upload."
    exit 0
else
    echo "Uploading /analytics/report to S3"
    aws s3 cp /analytics/report.html s3://$REPORT_BUCKET/reports/$REPORT_YEAR/$REPORT_MONTH/
    if [ $? -ne 0 ]; then
        echo "Error uploading report"
        exit 1
    else
        echo "Report uploaded"
        echo "Report URL: https://$REPORT_BUCKET.s3.amazonaws.com/reports/$REPORT_YEAR/$REPORT_MONTH/report.html"
        exit 0
    fi
fi

#!/usr/bin/env bash
npm run generate
cd admin && npm run generate
cd ../cdk && npm run generate && cd ..

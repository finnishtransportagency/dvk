#!/bin/sh
cd /e2e
npm ci && npx playwright install --with-deps && npx playwright test
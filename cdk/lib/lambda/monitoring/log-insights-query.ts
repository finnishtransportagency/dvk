import { CloudWatchLogs, SNS } from 'aws-sdk';
import apiLambdaFunctions from '../../lambda/api/apiLambdaFunctions';
import Config from '../../config';

export const handler = async (event: any) => {
  const cloudwatchLogs = new CloudWatchLogs();
  const snsTopicArn = process.env.SNS_TOPIC_ARN;
  const hoursSince = process.env.HOURS_SINCE ? Number(process.env.HOURS_SINCE) : 24;
  const env = Config.getEnvironment();

  if (!snsTopicArn) {
    throw new Error('Missing required environment variables');
  }

  let logGroupNames = [];
  for (const lambdaFunc of apiLambdaFunctions) {
    const lambdaName = `${lambdaFunc.functionName}-${env}`.toLocaleLowerCase();
    const logGroupName = '/dvk/lambda/' + lambdaName;
    logGroupNames.push(logGroupName);
  }
  console.log('Log groups:', logGroupNames);

  const query = [
    'fields @message, level',
    '| filter @message like /(\\w+) api/',
    '| parse @message /(?<api_name>\\w+) api/',
    '| stats count(*) as Lukumaara by level, api_name',
    '| sort Lukumaara desc',
  ].join(' ');

  console.log('Query:', query);
  console.log('Hours since:', hoursSince);

  const startTime = new Date();
  startTime.setHours(startTime.getHours() - hoursSince); // Look back 1 hour

  const startQuery = await cloudwatchLogs
    .startQuery({
      logGroupNames,
      startTime: startTime.getTime(),
      endTime: new Date().getTime(),
      queryString: query,
    })
    .promise();

  // Wait for query to complete
  const maxAttempts = 10;
  let attempts = 0;
  let queryResults;

  while (attempts < maxAttempts) {
    console.log('Attempt:', attempts);
    const results = await cloudwatchLogs
      .getQueryResults({
        queryId: startQuery.queryId!,
      })
      .promise();

    if (results.status === 'Complete') {
      queryResults = results;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  console.log('Query results:', queryResults);

  if (!queryResults || !queryResults.results || queryResults.results.length === 0) {
    console.log('No results found');
    return;
  }

  // Format results for SNS
  const formattedResults = queryResults.results
    .map((result) => {
      const level = result.find((field) => field.field === 'level')?.value ?? 'N/A';
      const lukumaara = result.find((field) => field.field === 'Lukumaara')?.value ?? '0';
      const api = result.find((field) => field.field === 'api_name')?.value ?? 'N/A';

      return `Level: ${level}, API: ${api}, Count: ${lukumaara}`;
    })
    .join('\n');

  // Count the total number of errors
  const totalErrors = queryResults.results.reduce((acc, result) => {
    const lukumaara = result.find((field) => field.field === 'Lukumaara')?.value ?? '0';
    return acc + Number(lukumaara);
  }, 0);

  // Send to SNS
  const sns = new SNS();
  await sns
    .publish({
      TopicArn: snsTopicArn,
      Subject: 'DVK External API Fetch Failures Report',
      Message: `API Fetch Failures in the last ${hoursSince} hours:\n\n${formattedResults}`,
      MessageAttributes: {
        'Environment': {
          DataType: 'String',
          StringValue: env,
        },
        'ErrorCount': {
          DataType: 'Number',
          StringValue: totalErrors.toString(),
        },
        'Severity': {
          DataType: 'String',
          StringValue: totalErrors > 0 ? 'High' : 'Low',
        },
      },
    })
    .promise();
};

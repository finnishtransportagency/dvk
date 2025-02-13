import { CloudWatchLogsClient, StartQueryCommand, GetQueryResultsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import apiLambdaFunctions from '../../lambda/api/apiLambdaFunctions';
import Config from '../../config';

export const handler = async (event: any) => {
  const cloudwatchLogs = new CloudWatchLogsClient({});
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

  const startQueryCommand = new StartQueryCommand({
    logGroupNames,
    startTime: startTime.getTime(),
    endTime: new Date().getTime(),
    queryString: query,
  });

  const startQuery = await cloudwatchLogs.send(startQueryCommand);

  // Wait for query to complete
  const maxAttempts = 10;
  let attempts = 0;
  let queryResults;

  while (attempts < maxAttempts) {
    console.log('Attempt:', attempts);
    const getQueryResultsCommand = new GetQueryResultsCommand({
      queryId: startQuery.queryId,
    });

    const results = await cloudwatchLogs.send(getQueryResultsCommand);

    if (results.status === 'Complete') {
      queryResults = results;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  console.log('Query results:', queryResults);

  if (!queryResults?.results?.length) {
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

  // Initialize the SNS client
  const sns = new SNSClient({});

  // Create and send the publish command
  const publishCommand = new PublishCommand({
    TopicArn: snsTopicArn,
    Subject: 'DVK External API Fetch Failures Report',
    Message: `API Fetch Failures in the last ${hoursSince} hours:\n\n${formattedResults}`,
    MessageAttributes: {
      Environment: {
        DataType: 'String',
        StringValue: env,
      },
      ErrorCount: {
        DataType: 'Number',
        StringValue: totalErrors.toString(),
      },
      Severity: {
        DataType: 'String',
        StringValue: totalErrors > 0 ? 'High' : 'Low',
      },
    },
  });

  await sns.send(publishCommand);
};

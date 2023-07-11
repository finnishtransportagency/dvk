import { Context } from 'aws-lambda';

export const context: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: '',
  invokedFunctionArn: '',
  logGroupName: '',
  logStreamName: '',
  awsRequestId: '',
  memoryLimitInMB: '',
  functionVersion: '',
  getRemainingTimeInMillis: () => 0,
  done: () => {},
  succeed: () => {},
  fail: () => {},
};

import { AppSyncResolverEvent, Context } from 'aws-lambda';
import { FairwayCard, QueryFairwayCardArgs } from '../graphql/generated';

export const mockContext: Context = {
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

export const mockQueryFairwayCardArgsEvent: AppSyncResolverEvent<QueryFairwayCardArgs> = {
  arguments: { id: 'test' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};

export const mockQueryFairwayCardArgsFairwayCardEvent: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard> = {
  arguments: { id: 'test' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: { id: 'test', fairways: [{ id: 10 }], name: { fi: 'Testfi', sv: 'Testsv', en: 'Testen' }, n2000HeightSystem: true },
  stash: {},
};

import { ALBEvent, AppSyncResolverEvent, Context } from 'aws-lambda';
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

// Mock for query with id (string) as param, used for fairway and harbor queries
export const mockQueryByIdEvent: AppSyncResolverEvent<QueryFairwayCardArgs> = {
  arguments: { id: 'test', version: 'v0' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};

export const mockQueryFairwayCardArgsFairwayCardEvent: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard> = {
  arguments: { id: 'test', version: 'v0' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: { id: 'test', version: 'v0', fairways: [{ id: 10 }], name: { fi: 'Testfi', sv: 'Testsv', en: 'Testen' }, n2000HeightSystem: true },
  stash: {},
};

export const mockVoidEvent: AppSyncResolverEvent<void> = {
  arguments: undefined,
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};

export const mockALBEvent = (type: string, fairwayClass?: string): ALBEvent => {
  return {
    requestContext: { elb: { targetGroupArn: 'arn' } },
    body: null,
    httpMethod: 'GET',
    path: '/api/featureloader',
    isBase64Encoded: false,
    multiValueQueryStringParameters: { type: [type], vaylaluokka: [fairwayClass ?? ''] },
  };
};

export const mockAISALBEvent = (path: string): ALBEvent => {
  return {
    requestContext: { elb: { targetGroupArn: 'arn' } },
    body: null,
    httpMethod: 'GET',
    path: '/api/' + path,
    isBase64Encoded: false,
  };
};

export const mockPilotRoutesALBEvent = (path: string): ALBEvent => {
  return {
    requestContext: { elb: { targetGroupArn: 'arn' } },
    body: null,
    httpMethod: 'GET',
    path: '/api/' + path,
    isBase64Encoded: false,
  };
};

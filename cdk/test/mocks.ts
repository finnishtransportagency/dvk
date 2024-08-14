import { ALBEvent, AppSyncResolverEvent, Context } from 'aws-lambda';
import { FairwayCard, QueryFairwayCardArgs, QueryFairwayCardPreviewArgs, Status } from '../graphql/generated';

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
  arguments: { id: 'test' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};

// Mock for query with id (string) and version as params, used for fairway and harbor queries
export const mockQueryByIdAndVersionEvent: AppSyncResolverEvent<QueryFairwayCardArgs> = {
  arguments: { id: 'test', version: 'v2' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};

// Mock for query with id (string) and public status as params, used for fairway and harbor queries
export const mockQueryByIdAndStatusPublicEvent: AppSyncResolverEvent<QueryFairwayCardArgs> = {
  arguments: { id: 'test', status: [Status.Public] },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};

// Mock for query with id (string) and version as param, used for fairway and harbor preview queries
export const mockQueryPreviewEvent: AppSyncResolverEvent<QueryFairwayCardPreviewArgs> = {
  arguments: { id: 'test', version: 'v0_latest' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};

export const mockQueryFairwayCardArgsFairwayCardEvent: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard> = {
  arguments: { id: 'test', version: 'v0_latest' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: { id: 'test', version: 'v0_latest', fairways: [{ id: 10 }], name: { fi: 'Testfi', sv: 'Testsv', en: 'Testen' }, n2000HeightSystem: true },
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

export const mockALBEvent = (path: string): ALBEvent => {
  return {
    requestContext: { elb: { targetGroupArn: 'arn' } },
    body: null,
    httpMethod: 'GET',
    path: '/api/' + path,
    isBase64Encoded: false,
  };
};

export const mockFeaturesALBEvent = (type: string, fairwayClass?: string): ALBEvent => {
  return {
    requestContext: { elb: { targetGroupArn: 'arn' } },
    body: null,
    httpMethod: 'GET',
    path: '/api/featureloader',
    isBase64Encoded: false,
    multiValueQueryStringParameters: { type: [type], vaylaluokka: [fairwayClass ?? ''] },
  };
};

import * as path from 'path';

interface BackendLambda {
  entry: string;
  fieldName: string; // this should correlate to graphql schema field name
  typeName: string;
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairwayCards-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCards',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCard-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCard',
  },
  {
    entry: path.join(__dirname, 'query/fairwayNavigationLines-handler.ts'),
    typeName: 'Fairway',
    fieldName: 'navigationLines',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardFairways-handler.ts'),
    typeName: 'FairwayCard',
    fieldName: 'fairways',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardsByFairwayId-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCardsByFairwayId',
  },
];

export default lambdaFunctions;

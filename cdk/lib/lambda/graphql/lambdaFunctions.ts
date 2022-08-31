import * as path from 'path';

interface BackendLambda {
  entry: string;
  fieldName: string; // this should correlate to graphql schema field name
  typeName: string;
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairwaysCards-handler.ts'),
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
    entry: path.join(__dirname, 'query/navigationLines-handler.ts'),
    typeName: 'Query',
    fieldName: 'navigationLines',
  },
];

export default lambdaFunctions;

import * as path from 'path';

interface BackendLambda {
  entry: string;
  fieldName?: string; // this should correlate to graphql schema field name
  typeName?: string;
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairways-handler.ts'),
  },
  {
    entry: path.join(__dirname, 'query/fairway-handler.ts'),
  },
  {
    entry: path.join(__dirname, 'query/fairwayNavigationLines-handler.ts'),
    typeName: 'Fairway',
    fieldName: 'navigationLines',
  },
  {
    entry: path.join(__dirname, 'query/navigationLines-handler.ts'),
  },
];

export default lambdaFunctions;

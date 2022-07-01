import * as path from 'path';

interface BackendLambda {
  entry: string;
  functionName?: string; // this should correlate to graphql schema function name
  typeName?: 'Query' | 'Mutation';
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairways-handler.ts'),
  },
  {
    entry: path.join(__dirname, 'query/fairway-handler.ts'),
  },
];

export default lambdaFunctions;

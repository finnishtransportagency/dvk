import * as path from 'path';

interface BackendLambda {
  entry: string;
  functionName?: string; // this should correlate to graphql schema function name
  typeName?: TypeName;
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairways-handler.ts'),
  },
  {
    entry: path.join(__dirname, 'query/fairway-handler.ts'),
  },
];

export type TypeName = 'Query' | 'Mutation' | 'Subscription';

export default lambdaFunctions;

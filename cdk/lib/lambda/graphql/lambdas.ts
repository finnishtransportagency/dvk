import * as path from 'path';
interface BackendLambda {
  entry: string;
  functionName: string;
  typeName: 'Query' | 'Mutation';
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairways-handler.ts'),
    functionName: 'fairways',
    typeName: 'Query',
  },
];

export default lambdaFunctions;

import * as path from 'path';

interface BackendAPILambda {
  entry: string;
  pathPattern: string;
  functionName: string;
}

const apiLambdaFunctions: BackendAPILambda[] = [
  {
    entry: path.join(__dirname, 'csv-handler.ts'),
    pathPattern: '/api/csv',
    functionName: 'csv',
  },
];

export default apiLambdaFunctions;

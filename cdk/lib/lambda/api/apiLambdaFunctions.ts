import * as path from 'path';

interface BackendAPILambda {
  entry: string;
  pathPattern: string;
  functionName?: string;
}

const apiLambdaFunctions: BackendAPILambda[] = [
  {
    entry: path.join(__dirname, 'map-handler.ts'),
    pathPattern: '/api/map',
  },
];

export default apiLambdaFunctions;

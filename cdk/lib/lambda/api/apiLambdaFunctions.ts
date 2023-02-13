import * as path from 'path';

interface BackendAPILambda {
  entry: string;
  pathPattern: string;
  functionName: string;
  priority: number;
}

const apiLambdaFunctions: BackendAPILambda[] = [
  {
    entry: path.join(__dirname, 'featureloader-handler.ts'),
    pathPattern: '/api/featureloader',
    functionName: 'featureloader',
    priority: 10,
  },
  {
    entry: path.join(__dirname, 'login.ts'),
    pathPattern: '/api/login',
    functionName: 'login',
    priority: 20,
  },
];

export default apiLambdaFunctions;

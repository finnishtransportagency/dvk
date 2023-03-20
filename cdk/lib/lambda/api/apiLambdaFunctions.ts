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
    pathPattern: '/yllapito/kirjaudu.html',
    functionName: 'login',
    priority: 20,
  },
  {
    entry: path.join(__dirname, 'logout.ts'),
    pathPattern: '/yllapito/api/logout',
    functionName: 'logout',
    priority: 30,
  },
];

export default apiLambdaFunctions;

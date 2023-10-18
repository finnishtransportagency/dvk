import * as path from 'path';

interface BackendAPILambda {
  entry: string;
  pathPattern: string;
  functionName: string;
  priority: number;
  useVpc?: boolean;
}

const apiLambdaFunctions: BackendAPILambda[] = [
  {
    entry: path.join(__dirname, 'featureloader-handler.ts'),
    pathPattern: '/api/featureloader',
    functionName: 'featureloader',
    priority: 10,
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'vessellocations-handler.ts'),
    pathPattern: '/api/vessellocations',
    functionName: 'vessel-locations',
    priority: 13,
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'vessels-handler.ts'),
    pathPattern: '/api/vessels',
    functionName: 'vessels',
    priority: 15,
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'login.ts'),
    pathPattern: '/yllapito/kirjaudu.html',
    functionName: 'login',
    priority: 20,
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'logout.ts'),
    pathPattern: '/yllapito/api/logout',
    functionName: 'logout',
    priority: 30,
    useVpc: false,
  },
];

export default apiLambdaFunctions;

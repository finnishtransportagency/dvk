import * as path from 'path';

interface BackendAPILambda {
  entry: string;
  pathPattern: string;
  functionName: string;
  priority: number;
  useVpc?: boolean;
  useMonitoring?: boolean;
}

const apiLambdaFunctions: BackendAPILambda[] = [
  {
    entry: path.join(__dirname, 'featureloader-handler.ts'),
    pathPattern: '/api/featureloader',
    functionName: 'featureloader',
    priority: 10,
    useVpc: true,
    useMonitoring: true,
  },
  {
    entry: path.join(__dirname, 'dirway-handler.ts'),
    pathPattern: '/api/dirways',
    functionName: 'dirways',
    priority: 12,
    useVpc: true,
    useMonitoring: true,
  },
  {
    entry: path.join(__dirname, 'aislocations-handler.ts'),
    pathPattern: '/api/aislocations',
    functionName: 'aislocations',
    priority: 14,
    useVpc: true,
    useMonitoring: true,
  },
  {
    entry: path.join(__dirname, 'aisvessels-handler.ts'),
    pathPattern: '/api/aisvessels',
    functionName: 'aisvessels',
    priority: 16,
    useVpc: true,
    useMonitoring: true,
  },
  {
    entry: path.join(__dirname, 'pilotroute-handler.ts'),
    pathPattern: '/api/pilotroutes',
    functionName: 'pilotroutes',
    priority: 18,
    useVpc: true,
    useMonitoring: true,
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

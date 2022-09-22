function errorMessage(variable: string): string {
  return `Environment variable ${variable} missing`;
}

function getEnvironment(): string {
  if (process.env.ENVIRONMENT) {
    return process.env.ENVIRONMENT;
  }
  throw new Error(errorMessage('ENVIRONMENT'));
}

export function isPermanentEnvironment() {
  return ['dev', 'test', 'prod'].indexOf(getEnvironment()) >= 0;
}

export function isProductionEnvironment() {
  return 'prod' === getEnvironment();
}

export function getHeaders() {
  if (isPermanentEnvironment()) {
    return undefined;
  } else {
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    };
  }
}

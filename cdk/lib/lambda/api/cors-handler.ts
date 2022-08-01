import { log } from '../logger';

export const handler = async (): Promise<object> => {
  log.debug(`cors()`);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'localhost',
      'Access-Control-Allow-Methods': '*',
    },
  };
};

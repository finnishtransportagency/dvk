import { log } from '../logger';

export const handler = async (event: object): Promise<object> => {
  log.info({ event }, `map()`);
  // TODO implement
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};

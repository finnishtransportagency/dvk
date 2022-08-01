import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `map()`);
  // TODO implement
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};

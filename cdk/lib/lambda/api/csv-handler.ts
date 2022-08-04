import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `csv()`);
  // TODO implement
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'Hello from Lambda!' }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  };
};

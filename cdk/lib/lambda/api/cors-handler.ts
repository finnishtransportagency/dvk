import { ALBResult } from 'aws-lambda';
import { log } from '../logger';

export const handler = async (): Promise<ALBResult> => {
  log.debug(`cors()`);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  };
};

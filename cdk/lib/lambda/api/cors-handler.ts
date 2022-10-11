import { ALBResult } from 'aws-lambda';
import { getAllowOrigin } from '../environment';
import { log } from '../logger';

export const handler = async (): Promise<ALBResult> => {
  log.debug(`cors()`);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': getAllowOrigin(),
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  };
};

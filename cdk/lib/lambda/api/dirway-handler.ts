import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import { toBase64Response } from '../util';
import { getHeaders } from '../environment';
import { fetchDirways } from './ibnet';
import { getFeatureCacheControlHeaders } from '../../cache';

export const DIRWAYS_KEY = 'dirways';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `dirways()`);
  let base64Response: string | undefined;
  let statusCode = 200;
  try {
    const dirwayData = await fetchDirways();
    log.debug('dirway data: %d', dirwayData.features.length);
    base64Response = await toBase64Response(dirwayData);
  } catch (e) {
    base64Response = undefined;
    statusCode = 503;
  }

  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getHeaders(),
      ...getFeatureCacheControlHeaders(DIRWAYS_KEY),
      'Content-Type': ['application/geo+json'],
    },
  };
};

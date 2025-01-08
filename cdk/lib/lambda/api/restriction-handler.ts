import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import { toBase64Response } from '../util';
import { getHeaders } from '../environment';
import { fetchRestrictions } from './ibnet';
import { getFeatureCacheControlHeaders } from '../../cache';

export const RESTRICTIONS_KEY = 'restrictions';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `restrictions()`);
  let base64Response: string | undefined;
  let statusCode = 200;
  try {
    const restrictionData = await fetchRestrictions();
    log.debug('restriction data: %d', restrictionData.features.length);
    base64Response = await toBase64Response(restrictionData);
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
      ...getFeatureCacheControlHeaders(),
      'Content-Type': ['application/geo+json'],
    },
  };
};

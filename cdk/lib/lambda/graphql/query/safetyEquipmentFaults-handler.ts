import { SafetyEquipmentFault } from '../../../../graphql/generated';
import { AppSyncResolverEvent } from 'aws-lambda';
import { fetchVATUByApi, TurvalaiteVikatiedotAPIModel } from './vatu';
import { log } from '../../logger';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getEnvironment } from '../../environment';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-west-1' });

function getKey() {
  return 'safetyequipmentfault-graphql';
}

function getCacheBucketName() {
  return `featurecache-${getEnvironment()}`;
}

async function cacheResponse(key: string, response: object) {
  const expires = new Date();
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
  const command = new PutObjectCommand({
    Key: key,
    Bucket: getCacheBucketName(),
    Expires: expires,
    Body: JSON.stringify(response),
  });
  await s3Client.send(command);
  log.debug(`${key} cached`);
}

type CacheResponse = {
  expired: boolean;
  data?: string;
};

async function getFromCache(key: string): Promise<CacheResponse> {
  try {
    const data = await s3Client.send(
      new GetObjectCommand({
        Key: key,
        Bucket: getCacheBucketName(),
      })
    );
    if (data.Body) {
      log.debug(`returning ${key} from cache`);
      const streamToString = (stream: Readable): Promise<string> =>
        new Promise((resolve, reject) => {
          const chunks: Uint8Array[] = [];
          stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
      return {
        expired: data.Expires !== undefined && data.Expires.getTime() < Date.now(),
        data: await streamToString(data.Body as Readable),
      };
    }
  } catch (e) {
    // errors ignored also not found
  }
  return { expired: true };
}

export const handler = async (event: AppSyncResolverEvent<void>): Promise<SafetyEquipmentFault[]> => {
  log.info(`safetyEquipmentFaults(${event.identity})`);
  const key = getKey();
  try {
    const faults = await fetchVATUByApi<TurvalaiteVikatiedotAPIModel>('vikatiedot');
    log.debug('faults: %d', faults.length);
    const response = faults.map((apiFault) => {
      const fault: SafetyEquipmentFault = {
        id: apiFault.vikaId,
        name: {
          fi: apiFault.turvalaiteNimiFI,
          sv: apiFault.turvalaiteNimiSV,
        },
        equipmentId: apiFault.turvalaiteNumero,
        typeCode: apiFault.vikatyyppiKoodi,
        type: {
          fi: apiFault.vikatyyppiFI,
          sv: apiFault.vikatyyppiSV,
        },
        recordTime: Date.parse(apiFault.kirjausAika),
        geometry: apiFault.geometria,
      };
      return fault;
    });
    await cacheResponse(key, response);
    return response;
  } catch (e) {
    log.error('Getting safety equipment faults failed: %s', e);
    const cacheResponseData = await getFromCache(key);
    if (cacheResponseData.data) {
      log.warn('Returning expired response from s3 cache');
      return JSON.parse(cacheResponseData.data);
    } else {
      throw e;
    }
  }
};

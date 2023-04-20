import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { MarineWarning } from '../../../../graphql/generated';
import { fetchMarineWarnings, parseDateTimes } from '../../api/pooki';
import { getEnvironment } from '../../environment';
import { log } from '../../logger';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-west-1' });

function getKey() {
  return 'marinewarning-graphql';
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

export const handler = async (): Promise<MarineWarning[]> => {
  const key = getKey();
  try {
    const resp = await fetchMarineWarnings();
    const warnings = [];
    for (const feature of resp.features) {
      const dates = parseDateTimes(feature);
      const warning: MarineWarning = {
        id: feature.properties?.ID,
        number: feature.properties?.NUMERO || 0,
        area: { fi: feature.properties?.ALUEET_FI, sv: feature.properties?.ALUEET_SV, en: feature.properties?.ALUEET_EN },
        type: { fi: feature.properties?.TYYPPI_FI, sv: feature.properties?.TYYPPI_SV, en: feature.properties?.TYYPPI_EN },
        location: { fi: feature.properties?.SIJAINTI_FI, sv: feature.properties?.SIJAINTI_SV, en: feature.properties?.SIJAINTI_EN },
        description: { fi: feature.properties?.SISALTO_FI, sv: feature.properties?.SISALTO_SV, en: feature.properties?.SISALTO_EN },
        startDateTime: dates.startDateTime,
        endDateTime: dates.endDateTime,
        dateTime: dates.dateTime || 0,
        notifier: feature.properties?.TIEDOKSIANTAJA,
        equipmentId: Number(feature.properties?.TURVALAITE_TXT?.match(/\d.*/)[0]),
        lineId: Number(feature.properties?.NAVIGOINTILINJA_TXT?.match(/\d.*/)[0]),
        areaId: Number(feature.properties?.VAYLAALUE_TXT?.match(/\d.*/)[0]),
      };
      warnings.push(warning);
    }
    await cacheResponse(key, warnings);
    return warnings;
  } catch (e) {
    log.error('Getting marine warnings failed: %s', e);
    const cacheResponseData = await getFromCache(key);
    if (cacheResponseData.data) {
      log.warn('Returning expired response from s3 cache');
      return JSON.parse(cacheResponseData.data);
    } else {
      throw e;
    }
  }
};

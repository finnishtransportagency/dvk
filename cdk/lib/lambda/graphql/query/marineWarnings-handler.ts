import { MarineWarning } from '../../../../graphql/generated';
import { parseDateTimes } from '../../api/pooki';
import { log } from '../../logger';
import { cacheResponse, getFromCache } from '../cache';
import { fetchMarineWarnings } from '../../api/axios';
import { FeatureCollection } from 'geojson';

function getKey() {
  return 'marinewarning-graphql';
}

export const handler = async (): Promise<MarineWarning[]> => {
  const key = getKey();
  try {
    const resp = await fetchMarineWarnings();
    const warnings = [];
    for (const feature of (resp.data as FeatureCollection).features) {
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

import { GeometryPoint, SafetyEquipmentFault } from '../../../../graphql/generated';
import { AppSyncResolverEvent } from 'aws-lambda';
import { log } from '../../logger';
import { cacheResponse, getFromCache } from '../cache';
import { fetchVATUByApi } from '../../api/axios';
import { TurvalaiteVikatiedotFeature, TurvalaiteVikatiedotFeatureCollection } from '../../api/apiModels';

function getKey() {
  return 'safetyequipmentfault-graphql';
}

export const handler = async (event: AppSyncResolverEvent<void>): Promise<SafetyEquipmentFault[]> => {
  log.info(`safetyEquipmentFaults(${event.identity})`);
  const key = getKey();
  try {
    const faults = (await fetchVATUByApi<TurvalaiteVikatiedotFeature>('vikatiedot')).data as TurvalaiteVikatiedotFeatureCollection;
    log.debug('faults: %d', faults.features.length);
    const response = faults.features.map((apiFault) => {
      const fault: SafetyEquipmentFault = {
        id: apiFault.properties.vikaId,
        name: {
          fi: apiFault.properties.turvalaiteNimiFI,
          sv: apiFault.properties.turvalaiteNimiSV,
        },
        equipmentId: apiFault.properties.turvalaiteNumero,
        typeCode: apiFault.properties.vikatyyppiKoodi,
        type: {
          fi: apiFault.properties.vikatyyppiFI,
          sv: apiFault.properties.vikatyyppiSV,
          en: apiFault.properties.vikatyyppiEN,
        },
        recordTime: Date.parse(apiFault.properties.kirjausAika),
        geometry: apiFault.geometry as GeometryPoint,
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

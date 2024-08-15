import { SafetyEquipmentFault } from '../../../../graphql/generated';
import { AppSyncResolverEvent } from 'aws-lambda';
import { log } from '../../logger';
import { cacheResponse, getFromCache } from '../cache';
import { fetchVATUByApi } from '../../api/axios';
import { TurvalaiteVikatiedotAPIModel } from '../../api/apiModels';

function getKey() {
  return 'safetyequipmentfault-graphql';
}

export const handler = async (event: AppSyncResolverEvent<void>): Promise<SafetyEquipmentFault[]> => {
  log.info(`safetyEquipmentFaults(${event.identity})`);
  const key = getKey();
  try {
    const faults = (await fetchVATUByApi<TurvalaiteVikatiedotAPIModel>('vikatiedot')).data as TurvalaiteVikatiedotAPIModel[];
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
          en: apiFault.vikatyyppiEN,
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

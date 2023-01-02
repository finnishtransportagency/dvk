import { SafetyEquipmentFault } from '../../../../graphql/generated';
import { AppSyncResolverEvent } from 'aws-lambda';
import { fetchVATUByApi, TurvalaiteVikatiedotAPIModel } from './vatu';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<SafetyEquipmentFault[]> => {
  log.info(`safetyEquipmentFaults(${event.identity})`);
  const faults = await fetchVATUByApi<TurvalaiteVikatiedotAPIModel>('vikatiedot');
  log.debug('faults: %d', faults.length);
  return faults.map((apiFault) => {
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
};

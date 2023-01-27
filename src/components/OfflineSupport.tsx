import { IonIcon, IonText, IonItem } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OFFLINE_STORAGE } from '../utils/constants';
import { useFairwayCardListData, useMarineWarningsData, useSafetyEquipmentFaultData } from '../utils/dataLoader';
import {
  useArea12Layer,
  useArea3456Layer,
  useBoardLine12Layer,
  useBuoyLayer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useMareographLayer,
  useMarineWarningLayer,
  useNameLayer,
  useObservationLayer,
  usePilotLayer,
  useSafetyEquipmentLayer,
  useSpecialAreaLayer,
  useSpeedLimitLayer,
} from './FeatureLoader';

const OfflineSupport: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });

  const fairwayCardList = useFairwayCardListData();
  const equipmentFaultList = useSafetyEquipmentFaultData();
  const marineWarningList = useMarineWarningsData();
  const line12Layer = useLine12Layer();
  const line3456Layer = useLine3456Layer();
  const area12Layer = useArea12Layer();
  const area3456Layer = useArea3456Layer();
  const depth12Layer = useDepth12Layer();
  const speedLimitLayer = useSpeedLimitLayer();
  const specialAreaLayer = useSpecialAreaLayer();
  const pilotLayer = usePilotLayer();
  const harborLayer = useHarborLayer();
  const safetyEquipmentLayer = useSafetyEquipmentLayer();
  const marineWarningLayer = useMarineWarningLayer();
  const nameLayer = useNameLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const mareographLayer = useMareographLayer();
  const observationLayer = useObservationLayer();
  const buoyLayer = useBuoyLayer();

  const offlineUpdates = [
    fairwayCardList.dataUpdatedAt,
    equipmentFaultList.dataUpdatedAt,
    marineWarningList.dataUpdatedAt,
    line12Layer.dataUpdatedAt,
    line3456Layer.dataUpdatedAt,
    area12Layer.dataUpdatedAt,
    area3456Layer.dataUpdatedAt,
    depth12Layer.dataUpdatedAt,
    speedLimitLayer.dataUpdatedAt,
    specialAreaLayer.dataUpdatedAt,
    pilotLayer.dataUpdatedAt,
    harborLayer.dataUpdatedAt,
    safetyEquipmentLayer.dataUpdatedAt,
    marineWarningLayer.dataUpdatedAt,
    nameLayer.dataUpdatedAt,
    boardLine12Layer.dataUpdatedAt,
    mareographLayer.dataUpdatedAt,
    observationLayer.dataUpdatedAt,
    buoyLayer.dataUpdatedAt,
  ];
  const offlineErrors = [
    fairwayCardList.isError ? fairwayCardList.errorUpdatedAt : 0,
    equipmentFaultList.isError ? equipmentFaultList.errorUpdatedAt : 0,
    marineWarningList.isError ? marineWarningList.errorUpdatedAt : 0,
    line12Layer.isError ? line12Layer.errorUpdatedAt : 0,
    line3456Layer.isError ? line3456Layer.errorUpdatedAt : 0,
    area12Layer.isError ? area12Layer.errorUpdatedAt : 0,
    area3456Layer.isError ? area3456Layer.errorUpdatedAt : 0,
    depth12Layer.isError ? depth12Layer.errorUpdatedAt : 0,
    speedLimitLayer.isError ? speedLimitLayer.errorUpdatedAt : 0,
    specialAreaLayer.isError ? specialAreaLayer.errorUpdatedAt : 0,
    pilotLayer.isError ? pilotLayer.errorUpdatedAt : 0,
    harborLayer.isError ? harborLayer.errorUpdatedAt : 0,
    safetyEquipmentLayer.isError ? safetyEquipmentLayer.errorUpdatedAt : 0,
    marineWarningLayer.isError ? marineWarningLayer.errorUpdatedAt : 0,
    nameLayer.isError ? nameLayer.errorUpdatedAt : 0,
    boardLine12Layer.isError ? boardLine12Layer.errorUpdatedAt : 0,
    mareographLayer.isError ? mareographLayer.errorUpdatedAt : 0,
    observationLayer.isError ? observationLayer.errorUpdatedAt : 0,
    buoyLayer.isError ? buoyLayer.errorUpdatedAt : 0,
  ];
  const offlineLatestError = Math.max(...offlineErrors.filter((x) => !!x), 0);
  const offlineLatestUpdate = Math.max(...offlineUpdates.filter((x) => !!x), 0);
  const offlineOldestUpdate = Math.min(...offlineUpdates.filter((x) => !!x), Date.now());
  const oldestUpdateTimestamp = Date.now() - offlineOldestUpdate;

  return (
    <div className="offlineSupport">
      <IonItem detail={false} lines="none" className="ion-no-padding">
        <IonIcon slot="start" src="/assets/icon/alert_icon.svg" className={offlineLatestError > 0 ? 'danger' : 'warning'} />
        {offlineLatestError > 0 ? t('offlineSupportImpossible') : t('offlineSupportPartial')}
      </IonItem>
      <IonText>
        {offlineLatestError > 0 && (
          <p>
            <strong>{t('dataNotUpToDate')}</strong>
            <br />
            {t('dataUpdateFailedAt')} {t('datetimeFormat', { val: offlineLatestError })}
          </p>
        )}
        {!offlineLatestError && offlineLatestUpdate > 0 && (
          <p>
            <strong>{oldestUpdateTimestamp > OFFLINE_STORAGE.staleTime ? t('dataPartiallyUpToDate') : t('dataUpToDate')}</strong>
            <br />
            {t('latestDataUpdateAt')} {t('datetimeFormat', { val: offlineLatestUpdate })}
          </p>
        )}
      </IonText>
    </div>
  );
};

export default OfflineSupport;

import { IonIcon, IonText, IonItem } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OFFLINE_STORAGE } from '../utils/constants';
import { useFairwayCardListData, useMarineWarningsData, useSafetyEquipmentFaultData } from '../utils/dataLoader';
import {
  useArea12Layer,
  useArea3456Layer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useMarineWarningLayer,
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
  ];
  const offlineErrors = [
    fairwayCardList.errorUpdatedAt,
    equipmentFaultList.errorUpdatedAt,
    marineWarningList.errorUpdatedAt,
    line12Layer.errorUpdatedAt,
    line3456Layer.errorUpdatedAt,
    area12Layer.errorUpdatedAt,
    area3456Layer.errorUpdatedAt,
    depth12Layer.errorUpdatedAt,
    speedLimitLayer.errorUpdatedAt,
    specialAreaLayer.errorUpdatedAt,
    pilotLayer.errorUpdatedAt,
    harborLayer.errorUpdatedAt,
    safetyEquipmentLayer.errorUpdatedAt,
    marineWarningLayer.errorUpdatedAt,
  ];
  const offlineLatestError = Math.max(...offlineErrors);
  const offlineLatestUpdate = Math.max(...offlineUpdates);
  const offlineOldestUpdate = Math.min(...offlineUpdates);
  const oldestUpdateTimestamp = Date.now() - offlineOldestUpdate;

  return (
    <div className="offlineSupport">
      <IonItem detail={false} lines="none" className="ion-no-padding">
        <IonIcon slot="start" src="/assets/icon/alert_icon.svg" className={offlineLatestError > 0 ? 'danger' : 'warning'} />
        {t('offlineSupportPartial')}
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

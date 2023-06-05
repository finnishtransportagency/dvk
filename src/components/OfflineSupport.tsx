import { IonIcon, IonText, IonItem } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OFFLINE_STORAGE } from '../utils/constants';
import { useFairwayCardListData, useFeatureData, useMarineWarningsData, useSafetyEquipmentFaultData } from '../utils/dataLoader';
import alertIcon from '../theme/img/alert_icon.svg';

const OfflineSupport: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });

  const fairwayCardList = useFairwayCardListData();
  const equipmentFaultList = useSafetyEquipmentFaultData();
  const marineWarningList = useMarineWarningsData();
  const line12Layer = useFeatureData('line12');
  const line3456Layer = useFeatureData('line3456');
  const area12Layer = useFeatureData('area12');
  const area3456Layer = useFeatureData('area3456');
  const depth12Layer = useFeatureData('depth12');
  const speedLimitLayer = useFeatureData('restrictionarea');
  const specialAreaLayer = useFeatureData('specialarea');
  const pilotLayer = useFeatureData('pilot');
  const harborLayer = useFeatureData('harbor');
  const safetyEquipmentLayer = useFeatureData('safetyequipment');
  const safetyEquipmentFaultLayer = useFeatureData('safetyequipmentfault');
  const marineWarningLayer = useFeatureData('marinewarning');
  const nameLayer = useFeatureData('name');
  const boardLine12Layer = useFeatureData('boardline12');
  const mareographLayer = useFeatureData('mareograph');
  const observationLayer = useFeatureData('observation');
  const buoyLayer = useFeatureData('buoy');
  const bgLayerBa = useFeatureData('balticsea');
  const bgLayerFi = useFeatureData('finland');
  const bgLayerSea = useFeatureData('mml_meri');
  const bgLayerLake = useFeatureData('mml_jarvi');
  const bgLayerQuay = useFeatureData('mml_laiturit');
  const vtsLineLayer = useFeatureData('vtsline');
  const vtsPointLayer = useFeatureData('vtspoint');
  const circleLayer = useFeatureData('circle');

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
    safetyEquipmentFaultLayer.dataUpdatedAt,
    marineWarningLayer.dataUpdatedAt,
    nameLayer.dataUpdatedAt,
    boardLine12Layer.dataUpdatedAt,
    mareographLayer.dataUpdatedAt,
    observationLayer.dataUpdatedAt,
    buoyLayer.dataUpdatedAt,
    bgLayerBa.dataUpdatedAt,
    bgLayerFi.dataUpdatedAt,
    bgLayerSea.dataUpdatedAt,
    bgLayerLake.dataUpdatedAt,
    bgLayerQuay.dataUpdatedAt,
    vtsLineLayer.dataUpdatedAt,
    vtsPointLayer.dataUpdatedAt,
    circleLayer.dataUpdatedAt,
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
    safetyEquipmentFaultLayer.isError ? safetyEquipmentFaultLayer.errorUpdatedAt : 0,
    marineWarningLayer.isError ? marineWarningLayer.errorUpdatedAt : 0,
    nameLayer.isError ? nameLayer.errorUpdatedAt : 0,
    boardLine12Layer.isError ? boardLine12Layer.errorUpdatedAt : 0,
    mareographLayer.isError ? mareographLayer.errorUpdatedAt : 0,
    observationLayer.isError ? observationLayer.errorUpdatedAt : 0,
    buoyLayer.isError ? buoyLayer.errorUpdatedAt : 0,
    bgLayerBa.isError ? bgLayerBa.errorUpdatedAt : 0,
    bgLayerFi.isError ? bgLayerFi.errorUpdatedAt : 0,
    bgLayerSea.isError ? bgLayerSea.errorUpdatedAt : 0,
    bgLayerLake.isError ? bgLayerLake.errorUpdatedAt : 0,
    bgLayerQuay.isError ? bgLayerQuay.errorUpdatedAt : 0,
    vtsLineLayer.isError ? vtsLineLayer.errorUpdatedAt : 0,
    vtsPointLayer.isError ? vtsPointLayer.errorUpdatedAt : 0,
    circleLayer.isError ? circleLayer.errorUpdatedAt : 0,
  ];
  const offlineLatestError = Math.max(...offlineErrors.filter((x) => !!x), 0);
  const offlineLatestUpdate = Math.max(...offlineUpdates.filter((x) => !!x), 0);
  const offlineOldestUpdate = Math.min(...offlineUpdates.filter((x) => !!x), Date.now());
  const oldestUpdateTimestamp = Date.now() - offlineOldestUpdate;

  return (
    <div className="offlineSupport">
      <IonItem detail={false} lines="none" className="ion-no-padding">
        <IonIcon aria-hidden slot="start" src={alertIcon} className={offlineLatestError > 0 ? 'danger' : 'warning'} />
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

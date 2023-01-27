import { IonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFairwayCardListData, useMarineWarningsData, useSafetyEquipmentFaultData } from '../utils/dataLoader';
import {
  useArea12Layer,
  useArea3456Layer,
  useBackgroundLayer,
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

const OfflineStatus: React.FC = () => {
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
  const bgLayer = useBackgroundLayer();
  const statusOffline =
    !navigator.onLine ||
    (fairwayCardList.isPaused &&
      equipmentFaultList.isPaused &&
      marineWarningList.isPaused &&
      line12Layer.isPaused &&
      line3456Layer.isPaused &&
      area12Layer.isPaused &&
      area3456Layer.isPaused &&
      depth12Layer.isPaused &&
      speedLimitLayer.isPaused &&
      specialAreaLayer.isPaused &&
      pilotLayer.isPaused &&
      harborLayer.isPaused &&
      safetyEquipmentLayer.isPaused &&
      marineWarningLayer.isPaused &&
      nameLayer.isPaused &&
      boardLine12Layer.isPaused &&
      mareographLayer.isPaused &&
      observationLayer.isPaused &&
      buoyLayer.isPaused &&
      bgLayer.isPaused);

  return (
    <>
      {statusOffline && (
        <IonText className="offlineStatus">
          <strong>{t('serviceOffline')}</strong>
        </IonText>
      )}
    </>
  );
};

export default OfflineStatus;

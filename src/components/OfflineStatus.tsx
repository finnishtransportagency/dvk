import { IonText } from '@ionic/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDvkContext } from '../hooks/dvkContext';
import { refreshPrintableMap } from '../utils/common';
import { MAP } from '../utils/constants';
import { useFairwayCardListData, useFeatureData, useMarineWarningsData, useSafetyEquipmentFaultData } from '../utils/dataLoader';
import { getMap } from './DvkMap';

const OfflineStatus: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });

  const { state, dispatch } = useDvkContext();

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
      safetyEquipmentFaultLayer.isPaused &&
      marineWarningLayer.isPaused &&
      nameLayer.isPaused &&
      boardLine12Layer.isPaused &&
      mareographLayer.isPaused &&
      observationLayer.isPaused &&
      buoyLayer.isPaused &&
      bgLayerBa.isPaused &&
      bgLayerFi.isPaused &&
      bgLayerSea.isPaused);

  useEffect(() => {
    dispatch({
      type: 'setOffline',
      payload: {
        value: statusOffline,
      },
    });
  }, [statusOffline, dispatch]);

  const dvkMap = getMap();
  useEffect(() => {
    MAP.FEATURE_DATA_LAYERS.forEach((dataLayer) => {
      const layer = dvkMap.getFeatureLayer(dataLayer.id);
      if (dataLayer.noOfflineSupport && state.isOffline) layer.setVisible(false);
    });
    setTimeout(refreshPrintableMap, 100);
  }, [dvkMap, state.isOffline]);

  return (
    <>
      {state.isOffline && (
        <IonText className="offlineStatus">
          <strong>{t('serviceOffline')}</strong>
        </IonText>
      )}
    </>
  );
};

export default OfflineStatus;

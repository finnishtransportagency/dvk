import { IonText } from '@ionic/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDvkContext } from '../hooks/dvkContext';
import { getDuration } from '../utils/common';
import { MAP } from '../utils/constants';
import { useFairwayCardListData, useFeatureData, useMarineWarningsData, useSafetyEquipmentFaultData } from '../utils/dataLoader';
import { getMap } from './DvkMap';
import { useStaticDataLayer } from './FeatureLoader';

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
  const specialArea2Layer = useFeatureData('specialarea2');
  const specialArea9Layer = useFeatureData('specialarea9');
  const specialArea15Layer = useFeatureData('specialarea15');
  const pilotLayer = useFeatureData('pilot');
  const harborLayer = useFeatureData('harbor');
  const safetyEquipmentLayer = useFeatureData('safetyequipment');
  const safetyEquipmentFaultLayer = useFeatureData('safetyequipmentfault');
  const coastalWarningLayer = useFeatureData('marinewarning');
  const localWarningLayer = useFeatureData('marinewarning');
  const boaterWarningLayer = useFeatureData('marinewarning');
  const nameLayer = useFeatureData('name');
  const boardLine12Layer = useFeatureData('boardline12');
  const bgLayerBa = useStaticDataLayer('balticsea');
  const bgLayerFi = useStaticDataLayer('finland');
  const bgLayerSea = useStaticDataLayer('mml_meri');
  const bgLayerSeaShoreline = useStaticDataLayer('mml_meri_rantaviiva');
  const bgLayerLake = useStaticDataLayer('mml_jarvi');
  const bgLayerLakeShoreline = useStaticDataLayer('mml_jarvi_rantaviiva');
  const bgLayerHarbor = useStaticDataLayer('mml_satamat');
  const bgLayerQuay = useStaticDataLayer('mml_laiturit');
  const vtsLineLayer = useFeatureData('vtsline');
  const vtsPointLayer = useFeatureData('vtspoint');
  const circleLayer = useFeatureData('circle');

  const allData = [
    fairwayCardList,
    equipmentFaultList,
    marineWarningList,
    line12Layer,
    line3456Layer,
    area12Layer,
    area3456Layer,
    depth12Layer,
    speedLimitLayer,
    specialArea2Layer,
    specialArea9Layer,
    specialArea15Layer,
    pilotLayer,
    harborLayer,
    safetyEquipmentLayer,
    safetyEquipmentFaultLayer,
    coastalWarningLayer,
    localWarningLayer,
    boaterWarningLayer,
    nameLayer,
    boardLine12Layer,
    bgLayerBa,
    bgLayerFi,
    bgLayerSea,
    bgLayerSeaShoreline,
    bgLayerLake,
    bgLayerLakeShoreline,
    bgLayerHarbor,
    bgLayerQuay,
    vtsLineLayer,
    vtsPointLayer,
    circleLayer,
  ];

  const statusOffline = !navigator.onLine || allData.every((data) => data.isPaused);

  const lastUpdatedDuration = () => {
    const lastUpdatedTimes = allData.map((data) => data.dataUpdatedAt);
    const lastUpdate = Math.max(...lastUpdatedTimes);
    return getDuration(lastUpdate);
  };

  useEffect(() => {
    dispatch({
      type: 'setOffline',
      payload: {
        value: statusOffline,
      },
    });
  }, [statusOffline, dispatch]);

  const dvkMap = getMap();

  dvkMap.onTileStatusChange = () => {
    dispatch({
      type: 'setOffline',
      payload: {
        value: dvkMap.tileStatus === 'error',
      },
    });
  };

  window.ononline = async () => {
    /* Send test query to check if we really have connection to the backend */
    const url = new URL(window.location.origin);
    /* Set url param to avoid caches */
    url.searchParams.set('ts', '' + Date.now());

    try {
      const response = await fetch(url.toString(), { method: 'HEAD' });

      /* Unset offline mode only if test query succeed */
      if (response.ok) {
        dispatch({
          type: 'setOffline',
          payload: {
            value: false,
          },
        });
        dvkMap.tileStatus = 'ok';
      }
    } catch {
      /* NOTHING TO DO */
    }
  };

  useEffect(() => {
    MAP.FEATURE_DATA_LAYERS.forEach((dataLayer) => {
      const layer = dvkMap.getFeatureLayer(dataLayer.id);
      if (!dataLayer.offlineSupport && state.isOffline) layer.setVisible(false);
    });
  }, [dvkMap, state.isOffline]);

  return (
    <>
      {state.isOffline && (
        <IonText className="offlineStatus">
          <strong>
            {t('serviceOffline')}
            {lastUpdatedDuration() >= 12 ? '. ' + t('lastUpdatedDuration', { duration: lastUpdatedDuration() }) : undefined}
          </strong>
        </IonText>
      )}
    </>
  );
};

export default OfflineStatus;

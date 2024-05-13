import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { useFairwayCardListData, useFeatureData } from '../utils/dataLoader';
import { useEffect, useState } from 'react';
import { FairwayCardPartsFragment } from '../graphql/generated';
import { getFairwayListFairwayCards } from '../utils/fairwayCardUtils';
import { Card, EquipmentFairway, EquipmentFault, EquipmentFeatureProperties } from './features';

function addFairwayCardData(feature: Feature<Geometry>, fairwayCards: FairwayCardPartsFragment[]) {
  const fairways: EquipmentFairway[] = (feature.getProperties() as EquipmentFeatureProperties)?.fairways ?? [];
  const cardList = getFairwayListFairwayCards(fairways, fairwayCards);
  const cards: Card[] = cardList.map((c) => {
    return { id: c.id, name: c.name };
  });
  feature.set('fairwayCards', cards, true);
}

function handleSafetyEquipmentLayerChange() {
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
  const safetyEquipmentFaultSource = dvkMap.getVectorSource('safetyequipmentfault');

  if (selectedFairwayCardSource.getFeatures().length > 0) {
    for (const f of selectedFairwayCardSource.getFeatures()) {
      if (f.getProperties().featureType == 'safetyequipmentfault') {
        const feature = safetyEquipmentFaultSource.getFeatureById(f.getProperties().id) as Feature<Geometry>;
        selectedFairwayCardSource.removeFeature(f);
        selectedFairwayCardSource.addFeature(feature);
        safetyEquipmentFaultSource.removeFeature(feature);
      }
    }
    safetyEquipmentFaultSource.dispatchEvent('change');
    selectedFairwayCardSource.dispatchEvent('change');
  }
}

export function useSafetyEquipmentAndFaultFeatures() {
  const [ready, setReady] = useState(false);
  const [safetyEquipmentFeatures, setSafetyEquipmentFeatures] = useState<Feature<Geometry>[]>([]);
  const [safetyEquipmentFaultFeatures, setSafetyEquipmentFaultFeatures] = useState<Feature<Geometry>[]>([]);
  const {
    data: eData,
    dataUpdatedAt: eDataUpdatedAt,
    errorUpdatedAt: eErrorUpdatedAt,
    isPaused: eIsPaused,
    isError: eIsError,
  } = useFeatureData('safetyequipment');
  const {
    data: fData,
    dataUpdatedAt: fDataUpdatedAt,
    errorUpdatedAt: fErrorUpdatedAt,
    isPaused: fIsPaused,
    isError: fIsError,
  } = useFeatureData('safetyequipmentfault', true, 1000 * 60 * 15);
  const { data: fairwayCardData } = useFairwayCardListData();

  useEffect(() => {
    if (eData && fData && fairwayCardData) {
      const format = new GeoJSON();
      const efs = format.readFeatures(eData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const ffs = format.readFeatures(fData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const faultMap = new Map<number, EquipmentFault[]>();
      const equipmentFeatures: Feature<Geometry>[] = [];
      const faultFeatures: Feature<Geometry>[] = [];

      // Map safety equipment faults
      for (const ff of ffs) {
        const id = ff.getProperties().equipmentId as number;
        const feature = efs.find((ef) => ef.getId() === id);
        if (feature) {
          const fault: EquipmentFault = {
            faultId: ff.getId() as number,
            faultType: ff.getProperties().type,
            faultTypeCode: ff.getProperties().typeCode,
            recordTime: ff.getProperties().recordTime,
          };
          if (!faultMap.has(id)) {
            faultMap.set(id, []);
          }
          faultMap.get(id)?.push(fault);
        }
      }

      // Set fault properties to equipment features and divide features
      efs.forEach((feature) => {
        const faults = faultMap.get(feature.getId() as number);
        if (faults) {
          faults.sort((a, b) => b.recordTime - a.recordTime);
          feature.set('faults', faults, true);
          feature.set('dataSource', 'safetyequipmentfault', true);
          feature.set('featureType', 'safetyequipmentfault', true);
          feature.set('faultListStyle', true, true);
          faultFeatures.push(feature);
        } else {
          feature.set('dataSource', 'safetyequipment', true);
          feature.set('faultListStyle', false, true);
          equipmentFeatures.push(feature);
        }
        addFairwayCardData(feature, fairwayCardData.fairwayCards);
      });

      setSafetyEquipmentFeatures(equipmentFeatures);
      setSafetyEquipmentFaultFeatures(faultFeatures);
      setReady(true);
    }
  }, [eData, fData, fairwayCardData]);

  const dataUpdatedAt = Math.max(eDataUpdatedAt, fDataUpdatedAt);
  const errorUpdatedAt = Math.max(eErrorUpdatedAt, fErrorUpdatedAt);

  return {
    ready,
    safetyEquipmentFeatures,
    safetyEquipmentFaultFeatures,
    dataUpdatedAt,
    errorUpdatedAt,
    isPaused: eIsPaused || fIsPaused,
    isError: eIsError || fIsError,
  };
}

export function useSafetyEquipmentAndFaultLayer() {
  const { ready, safetyEquipmentFeatures, safetyEquipmentFaultFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } =
    useSafetyEquipmentAndFaultFeatures();

  useEffect(() => {
    const equipmentLayer = dvkMap.getFeatureLayer('safetyequipment');
    const faultLayer = dvkMap.getFeatureLayer('safetyequipmentfault');

    if (ready && (equipmentLayer.get('dataUpdatedAt') !== dataUpdatedAt || faultLayer.get('dataUpdatedAt') !== dataUpdatedAt)) {
      const equipmentSource = dvkMap.getVectorSource('safetyequipment');
      const faultSource = dvkMap.getVectorSource('safetyequipmentfault');

      equipmentSource.clear();
      faultSource.clear();
      equipmentSource.addFeatures(safetyEquipmentFeatures);
      faultSource.addFeatures(safetyEquipmentFaultFeatures);
      equipmentLayer.set('dataUpdatedAt', dataUpdatedAt);
      faultLayer.set('dataUpdatedAt', dataUpdatedAt);

      // in case there's selected fairway card containing safety equipment faults (to avoid duplicates)
      handleSafetyEquipmentLayerChange();
    }
    equipmentLayer.set('errorUpdatedAt', errorUpdatedAt, true);
    faultLayer.set('errorUpdatedAt', errorUpdatedAt, true);
  }, [dataUpdatedAt, errorUpdatedAt, ready, safetyEquipmentFaultFeatures, safetyEquipmentFeatures]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

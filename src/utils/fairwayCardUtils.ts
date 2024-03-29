import { TFunction } from 'i18next';
import { Fairway, FairwayCardPreviewQuery, FindAllFairwayCardsQuery, SafetyEquipmentFault } from '../graphql/generated';
import dvkMap from '../components/DvkMap';
import { MAP } from './constants';
import { Geometry, LineString, SimpleGeometry } from 'ol/geom';
import { Feature } from 'ol';
import { PilotageLimit } from '../components/content/fairwayCard/PilotInfo';

export function setFairwayCardByPreview(
  preview: boolean,
  id: string,
  data: FindAllFairwayCardsQuery | undefined,
  previewData: FairwayCardPreviewQuery | undefined
) {
  if (preview) {
    return previewData?.fairwayCardPreview ?? undefined;
  }
  const filteredFairwayCard = data?.fairwayCards.filter((card) => card.id === id);
  return filteredFairwayCard && filteredFairwayCard.length > 0 ? filteredFairwayCard[0] : undefined;
}

export function getTabLabel(t: TFunction, tabId: number): string {
  switch (tabId) {
    case 1:
      return t('title', { count: 1 });
    case 2:
      return t('harboursTitle');
    case 3:
      return t('areasTitle');
    default:
      return '-';
  }
}

export function getSafetyEquipmentFaultsByFairwayCardId(id: string): SafetyEquipmentFault[] {
  const faultSource = dvkMap.getVectorSource('safetyequipmentfault');
  const equipmentFaults: SafetyEquipmentFault[] = [];

  faultSource.getFeatures().forEach((f) => {
    const props = f.getProperties();
    const fairways = props.fairways;
    // check if fault is part of any fairwaycard, if true push fault to array
    for (const fairway of fairways) {
      const fairwayCards = fairway.fairwayCards;
      if (fairwayCards) {
        for (const fairwaycard of fairwayCards) {
          if (fairwaycard.id === id) {
            const faults = props.faults;
            // create new safetyequipmentfault objects
            for (const fault of faults) {
              const convertedGeometry = f.getGeometry()?.clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;
              const faultObject: SafetyEquipmentFault = {
                equipmentId: Number(f.getId()),
                geometry: { type: 'Point', coordinates: convertedGeometry.getFlatCoordinates() },
                id: fault.faultId,
                name: props.name,
                recordTime: fault.recordTime,
                type: fault.faultType,
                typeCode: fault.faultTypeCode,
              };
              equipmentFaults.push(faultObject);
            }
          }
        }
      }
    }
  });
  return equipmentFaults;
}

export const handleSafetyEquipmentLayerChange = () => {
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
  const safetyEquipmentFaultSource = dvkMap.getVectorSource('safetyequipmentfault');

  if (selectedFairwayCardSource.getFeatures().length > 0) {
    for (const f of selectedFairwayCardSource.getFeatures()) {
      if (f.getProperties().featureType == 'safetyequipment') {
        const feature = safetyEquipmentFaultSource.getFeatureById(f.getProperties().id) as Feature<Geometry>;
        safetyEquipmentFaultSource.removeFeature(feature);
      }
    }
    safetyEquipmentFaultSource.dispatchEvent('change');
  }
};

export function getPilotageLimitsByFairways(fairways: Fairway[]) {
  const source = dvkMap.getVectorSource('pilotagelimit');
  const pilotageLimitFeatures = source.getFeatures();
  const pilotageLimits: PilotageLimit[] = [];

  fairways.forEach((fairway) => {
    pilotageLimitFeatures.forEach((pilotageLimit) => {
      const limitProperties = pilotageLimit.getProperties();
      const limitGeometry = pilotageLimit.getGeometry() as Geometry;
      // related fairways are in one string where commas separate different ids
      const relatedIds = limitProperties.liittyyVayliin.split(',');
      if (relatedIds.includes(String(fairway.id))) {
        const pilotageLimitObject = {
          fid: limitProperties.fid,
          numero: limitProperties.numero,
          liittyyVayliin: limitProperties.liittyyVayliin,
          raja_fi: limitProperties.raja_fi,
          raja_sv: limitProperties.raja_sv,
          raja_en: limitProperties.raja_en,
          koordinaatit: limitGeometry.clone().transform(MAP.EPSG, 'EPSG:4326') as LineString,
        };
        pilotageLimits.push(pilotageLimitObject);
      }
    });
  });
  return pilotageLimits;
}

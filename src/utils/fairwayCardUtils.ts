import { TFunction } from 'i18next';
import { FairwayCardPreviewQuery, FindAllFairwayCardsQuery, SafetyEquipmentFault } from '../graphql/generated';
import dvkMap from '../components/DvkMap';
import proj4 from 'proj4';

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

  // coordinates are converted from ETRS-TM35FIN to WGS84
  proj4.defs('ETRS-TM35FIN', '+proj=utm +zone=35 +ellps=GRS80 +no_defs');
  proj4.defs('WGS84', '+proj=longlat +datum=WGS84 +no_defs');

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
              const faultObject: SafetyEquipmentFault = {
                equipmentId: Number(f.getId()),
                geometry: { type: 'Point', coordinates: proj4('ETRS-TM35FIN', 'WGS84', props.geometry.flatCoordinates) },
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

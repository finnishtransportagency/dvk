import { TFunction } from 'i18next';
import { Fairway, FairwayCardPartsFragment, FairwayCardPreviewQuery, FindAllFairwayCardsQuery, SafetyEquipmentFault } from '../graphql/generated';
import dvkMap from '../components/DvkMap';
import { MAP } from './constants';
import { Geometry, LineString, SimpleGeometry } from 'ol/geom';
import { Feature } from 'ol';
import { PilotageLimit } from '../components/content/fairwayCard/PilotInfo';
import {
  AreaFairway,
  EquipmentFairway,
  EquipmentFeatureProperties,
  LineFairway,
  PilotRouteFeatureProperties,
  PilotageLimitFeatureProperties,
} from '../components/features';

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
    case 4:
      return t('routesTitle');
    default:
      return '-';
  }
}

export function getSafetyEquipmentFaultsByFairwayCardId(id: string): SafetyEquipmentFault[] {
  const faultSource = dvkMap.getVectorSource('safetyequipmentfault');
  const equipmentFaults: SafetyEquipmentFault[] = [];

  faultSource.forEachFeature((f) => {
    const props = f.getProperties() as EquipmentFeatureProperties;
    const fairwayCards = props.fairwayCards ?? [];
    if (fairwayCards.some((fc) => fc.id === id)) {
      const faults = props.faults ?? [];
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

export function getPilotPlacesByFairwayCard(fairwayCard: FairwayCardPartsFragment) {
  const pilotPlaceSource = dvkMap.getVectorSource('pilot');
  const pilotPlaces: Feature<Geometry>[] = [];
  const placeIds: number[] = fairwayCard.trafficService?.pilot?.places?.map((place) => place.id) ?? [];
  placeIds.forEach((id) => {
    const feature = pilotPlaceSource.getFeatureById(id) as Feature<Geometry>;
    if (feature) pilotPlaces.push(feature);
  });
  return pilotPlaces;
}

export function getPilotageLimitsByFairways(fairways: Fairway[] | undefined, getOnlyNumber?: boolean) {
  const source = dvkMap.getVectorSource('pilotagelimit');
  const pilotageLimitFeatures = source.getFeatures();
  const pilotageLimits: PilotageLimit[] = [];
  const fairwayIds = fairways?.map((fairway) => String(fairway.id)) ?? [];

  pilotageLimitFeatures.forEach((pilotageLimit) => {
    const limitProperties = pilotageLimit.getProperties() as PilotageLimitFeatureProperties;
    const limitGeometry = pilotageLimit.getGeometry() as Geometry;

    // related fairways are in one string where commas separate different ids
    const relatedIds = limitProperties.liittyyVayliin.split(',');
    if (relatedIds.some((id) => fairwayIds.includes(id))) {
      let pilotageLimitObject;
      // added to avoid unnecessary heavy transforming function when only numero is needed
      if (getOnlyNumber) {
        pilotageLimitObject = {
          numero: limitProperties.numero,
        };
      } else {
        pilotageLimitObject = {
          fid: limitProperties.fid,
          numero: limitProperties.numero,
          liittyyVayliin: limitProperties.liittyyVayliin,
          raja_fi: limitProperties.raja_fi,
          raja_sv: limitProperties.raja_sv,
          raja_en: limitProperties.raja_en,
          koordinaatit: limitGeometry.clone().transform(MAP.EPSG, 'EPSG:4326') as LineString,
        };
      }
      pilotageLimits.push(pilotageLimitObject);
    }
  });
  return pilotageLimits;
}

export function getFairwayCardPilotRoutes(fairwayCard: FairwayCardPartsFragment, features: Feature<Geometry>[]) {
  const pilotRoutes = features.filter((f) => {
    const properties = f.getProperties() as PilotRouteFeatureProperties;
    return fairwayCard.pilotRoutes?.find((pr) => properties?.id === pr?.id) ?? false;
  });
  return pilotRoutes?.toSorted((a, b) => a?.getProperties()?.name.localeCompare(b?.getProperties()?.name, 'fi', { ignorePunctuation: true })) ?? [];
}

export function getPilotPlaceFairwayCards(pilotPlaceId: number, fairwayCards: FairwayCardPartsFragment[]) {
  return fairwayCards.filter((card) => {
    return card.trafficService?.pilot?.places?.some((place) => place.id === pilotPlaceId) ?? false;
  });
}

export function getPilotageLimitFairwayCards(pilotageLimitProperties: PilotageLimitFeatureProperties, fairwayCards: FairwayCardPartsFragment[]) {
  const fairwayIds = pilotageLimitProperties.liittyyVayliin.split(',');
  return fairwayCards.filter((fc) => {
    const fcIds = fc.fairways.map((f) => f.id);
    for (const element of fcIds) {
      if (fairwayIds.includes('' + element)) {
        return true;
      }
    }
    return false;
  });
}

export function getFairwayListFairwayCards(fairways: AreaFairway[] | LineFairway[] | EquipmentFairway[], fairwayCards: FairwayCardPartsFragment[]) {
  const fairwayIds = fairways.map((fairway) => fairway.fairwayId) ?? [];
  return fairwayCards.filter((card) => card.fairways.some((fairway) => fairwayIds.includes(fairway.id)));
}

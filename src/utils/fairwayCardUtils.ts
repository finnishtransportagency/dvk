import { TFunction } from 'i18next';
import { FairwayCardPartsFragment, FairwayCardPreviewQuery, FindAllFairwayCardsQuery } from '../graphql/generated';
import dvkMap from '../components/DvkMap';
import { Geometry } from 'ol/geom';
import { Feature } from 'ol';
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

export function getFairwayCardSafetyEquipmentFaults(fairwayCard: FairwayCardPartsFragment, features: Feature<Geometry>[]) {
  return features.filter((f) => {
    const fairwayCards = (f.getProperties() as EquipmentFeatureProperties).fairwayCards ?? [];
    return fairwayCards.some((card) => card.id === fairwayCard.id);
  });
}

export function getFairwayCardPilotPlaces(fairwayCard: FairwayCardPartsFragment) {
  const pilotPlaceSource = dvkMap.getVectorSource('pilot');
  const pilotPlaces: Feature<Geometry>[] = [];
  const placeIds: number[] = fairwayCard.trafficService?.pilot?.places?.map((place) => place.id) ?? [];
  placeIds.forEach((id) => {
    const feature = pilotPlaceSource.getFeatureById(id) as Feature<Geometry>;
    if (feature) pilotPlaces.push(feature);
  });
  return pilotPlaces;
}

export function getFairwayCardPilotageLimits(fairwayCard: FairwayCardPartsFragment, features: Feature<Geometry>[]) {
  const fairwayIds = fairwayCard.fairways?.map((fairway) => String(fairway.id)) ?? [];

  return features.filter((pilotageLimit) => {
    const limitProperties = pilotageLimit.getProperties() as PilotageLimitFeatureProperties;
    // related fairways are in one string where commas separate different ids
    const relatedIds = limitProperties.liittyyVayliin.split(',');
    return relatedIds.some((id) => fairwayIds.includes(id));
  });
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

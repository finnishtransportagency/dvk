import { TFunction } from 'i18next';
import { FairwayCardPartsFragment, FairwayCardPreviewQuery, FindAllFairwayCardsQuery } from '../graphql/generated';
import dvkMap from '../components/DvkMap';
import { Geometry, Point, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import {
  AreaFairway,
  EquipmentFairway,
  EquipmentFeatureProperties,
  LineFairway,
  PilotRouteFeatureProperties,
  PilotageLimitFeatureProperties,
} from '../components/features';
import * as olExtent from 'ol/extent';

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

function getFairwayCardFairwayAreas(fairwayCard: FairwayCardPartsFragment) {
  const area12Source = dvkMap.getVectorSource('area12');
  const fairwayAreas: Feature<Geometry>[] = [];
  for (const fairway of fairwayCard?.fairways || []) {
    for (const area of fairway.areas ?? []) {
      if (fairwayAreas.findIndex((f) => f.getId() === area.id) === -1) {
        const feature = area12Source.getFeatureById(area.id) as Feature<Geometry>;
        if (feature) {
          fairwayAreas.push(feature);
        }
      }
    }
  }
  return fairwayAreas;
}

export function getFairwayCardObservations(fairwayCard: FairwayCardPartsFragment, features: Feature<Geometry>[]) {
  const fairwayAreas: Feature<Geometry>[] = getFairwayCardFairwayAreas(fairwayCard);
  const maxDist = 21000; // 21km

  const extent = olExtent.createEmpty();
  for (const fa of fairwayAreas) {
    const geom = fa.getGeometry();
    if (geom) {
      olExtent.extend(extent, geom.getExtent());
    }
  }
  if (!olExtent.isEmpty(extent)) {
    olExtent.buffer(extent, maxDist + 1, extent);
    const featuresInExtent = features.filter((f) => {
      const point = f.getGeometry() as Point;
      return olExtent.containsCoordinate(extent, point.getCoordinates());
    });

    const closestFeatures: Array<{ feat: Feature<Geometry>; dist: number }> = [];

    for (const f of featuresInExtent) {
      const point = f.getGeometry() as Point;
      const coord = point.getCoordinates();
      let dist = maxDist + 1;
      for (const fa of fairwayAreas) {
        const area = fa.getGeometry() as Polygon;
        const closestCoord = area.getClosestPoint(coord);
        const pointDistance = Math.sqrt(Math.pow(coord[0] - closestCoord[0], 2) + Math.pow(coord[1] - closestCoord[1], 2));
        dist = Math.min(pointDistance, dist);
      }
      if (dist <= maxDist) {
        closestFeatures.push({ feat: f, dist: dist });
      }
    }
    closestFeatures.sort((a, b) => a.dist - b.dist);
    return closestFeatures.map((cf) => cf.feat);
  }
  return [];
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

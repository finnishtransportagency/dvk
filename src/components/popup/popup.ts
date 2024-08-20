import { Point, SimpleGeometry, Geometry, LineString } from 'ol/geom';
import Map from 'ol/Map';
import Overlay, { PanIntoViewOptions } from 'ol/Overlay';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { FeatureLayerId, Lang, MAP } from '../../utils/constants';
import Feature, { FeatureLike } from 'ol/Feature';
import dvkMap from '../DvkMap';
import { Coordinate } from 'ol/coordinate';
import { addPointerClickInteraction, addPointerMoveInteraction, setClickSelectionFeature, clearClickSelectionFeatures } from './selectInteraction';
import { addFairwayWidthIndicator } from './fairwayWidthIndicator';
import { TFunction } from 'i18next';
import { getAisVesselShipType } from '../../utils/aisUtils';
import {
  AisFeatureProperties,
  AreaFeatureProperties,
  BuoyFeatureProperties,
  DirwayFeatureProperties,
  EquipmentFeatureProperties,
  HarborFeatureProperties,
  LineFeatureProperties,
  MareographFeatureProperties,
  MarineWarningFeatureProperties,
  ObservationFeatureProperties,
  PilotFeatureProperties,
  PilotRouteFeatureProperties,
  PilotageLimitFeatureProperties,
  QuayFeatureProperties,
  VtsFeatureProperties,
} from '../features';
import { getMarineWarningDataLayerId } from '../../utils/common';

const panOptions: PanIntoViewOptions = {
  animation: {
    duration: 250,
  },
};

function setPopupPosition(popup: Overlay, coordinate: Coordinate, selectedFeature?: FeatureLike, popupPositioningCoordinate?: Coordinate) {
  /* Set timeout to make sure popup content is rendered before positioning, so autoPan works correctly */
  setTimeout(() => {
    if (popupPositioningCoordinate) {
      popup.setPosition(popupPositioningCoordinate);
    } else if (selectedFeature?.getGeometry()?.getType() === 'Point') {
      popup.setPosition((selectedFeature.getGeometry() as Point).getCoordinates());
    } else {
      const previousPosition = popup.getPosition();
      if (previousPosition !== coordinate) {
        popup.setPosition(coordinate);
      } else {
        // Force autopan to fit new popup content
        popup.panIntoView(panOptions);
      }
    }
  }, 100);
}

function showFeatureListPopup(
  features: FeatureLike[],
  coordinate: Coordinate,
  setPopupProperties: (properties: PopupProperties) => void,
  overlay: Overlay
) {
  setPopupProperties({
    featureList: {
      features: features,
      coordinate: coordinate,
    },
  });
  setPopupPosition(overlay, coordinate);
}

export function showFeaturePopup(
  features: FeatureLike[],
  selectedFeature: FeatureLike,
  coordinate: Coordinate,
  setPopupProperties: (properties: PopupProperties) => void,
  overlay?: Overlay
) {
  let popupPositioningCoordinate: Coordinate | undefined = undefined;
  const popup = overlay ?? dvkMap.olMap?.getOverlayById('popup');
  if (!popup) return;

  if (selectedFeature.getProperties().featureType === 'mareograph') {
    popup.setPositioning('center-right');
    popup.setOffset([-20, 0]);
  } else {
    popup.setPositioning('center-left');
    popup.setOffset([20, 0]);
  }

  const geom = (selectedFeature.getGeometry() as SimpleGeometry).clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;

  /* If selected feature is navigation line start "fairway width calculation process" */
  if (selectedFeature.getProperties().featureType === 'line') {
    let fairwayWidth: number | undefined = undefined;
    const areaFeatures = features.filter((f) => {
      return f.getProperties().featureType === 'area';
    });

    /* Continue only if clicked point is inside area polygon (area layer must be visible) */
    if (areaFeatures.length > 0) {
      const fairwayWidthFeature: Feature<Geometry> | undefined = addFairwayWidthIndicator(selectedFeature, areaFeatures, coordinate);
      if (fairwayWidthFeature) {
        fairwayWidth = fairwayWidthFeature.get('width');
        /* Set popup position right to the fairway width line */
        const geometry = fairwayWidthFeature.getGeometry() as LineString;
        const s = geometry.getFirstCoordinate();
        const e = geometry.getLastCoordinate();
        popupPositioningCoordinate = s[0] > e[0] ? s : e;
      }
    }
    setPopupProperties({
      [selectedFeature.getProperties().featureType]: {
        id: selectedFeature.getId(),
        coordinates: geom.getCoordinates() as number[],
        properties: selectedFeature.getProperties(),
        width: fairwayWidth,
      },
    });
  } else {
    setPopupProperties({
      [selectedFeature.getProperties().featureType]: {
        id: selectedFeature.getId(),
        coordinates: geom.getCoordinates() as number[],
        geometry: geom,
        properties: selectedFeature.getProperties(),
      },
    });
  }
  setPopupPosition(popup, coordinate, selectedFeature, popupPositioningCoordinate);
}

function singleNavigationLineOnArea(features: FeatureLike[]): boolean {
  if (features.length === 2) {
    return (
      features.filter((f) => f.get('featureType') === 'line').length === 1 && features.filter((f) => f.get('featureType') === 'area').length === 1
    );
  }
  return false;
}

export function addPopup(map: Map, setPopupProperties: (properties: PopupProperties) => void) {
  const container = document.getElementById('popup') as HTMLElement;
  const overlay = new Overlay({
    id: 'popup',
    element: container,
    autoPan: panOptions,
  });
  map.addOverlay(overlay);

  /* Selectable feature types in order of importance */
  const types = [
    'aisvessel',
    'pilot',
    'pilotagelimit',
    'pilotroute',
    'vtspoint',
    'quay',
    'section',
    'harbor',
    'marinewarning',
    'safetyequipment',
    'safetyequipmentfault',
    'observation',
    'buoy',
    'mareograph',
    'dirway',
    'vtsline',
    'line',
    'specialarea2',
    'specialarea15',
    'area',
  ];

  if (container) {
    container.addEventListener('pointercancel', (e) => {
      e.preventDefault();
    });
    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
    });
  }

  addPointerMoveInteraction(map, types);
  addPointerClickInteraction(map);

  map.on('singleclick', function (evt) {
    /* Remove fairway width features */
    dvkMap.getVectorSource('fairwaywidth').clear();
    /* Close popup */
    overlay.setPosition(undefined);
    setPopupProperties({});
    clearClickSelectionFeatures();

    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(
      evt.pixel,
      function (f) {
        if (
          types.includes(f.getProperties().featureType) &&
          features.findIndex((feat) => feat.get('featureType') === f.get('featureType') && feat.getId() == f.getId()) < 0
        ) {
          features.push(f);
        }
      },
      { hitTolerance: 3 }
    );

    if (singleNavigationLineOnArea(features)) {
      const feature = features.find((f) => f.get('featureType') === 'line');
      showFeaturePopup(features, feature as FeatureLike, evt.coordinate, setPopupProperties, overlay);
    } else if (features.length > 1) {
      features.sort((a, b) => types.indexOf(a.getProperties().featureType) - types.indexOf(b.getProperties().featureType));
      showFeatureListPopup(features, evt.coordinate, setPopupProperties, overlay);
    } else {
      const feature = features[0];
      if (feature) {
        setClickSelectionFeature(feature);
        showFeaturePopup(features, feature, evt.coordinate, setPopupProperties, overlay);
      }
    }
  });
}

export type FeatureDetailProperties = {
  header?: string[];
  featureType?: string;
  className?: string;
};

function getAisVesselDetails(t: TFunction, feature: FeatureLike) {
  const props = feature.getProperties() as AisFeatureProperties;
  const shipType = getAisVesselShipType(props.shipType);
  return {
    header: [props.name ?? ''],
    featureType: t(`ais.${shipType}`),
    className: shipType,
  };
}

function getMareographDetails(t: TFunction, feature: FeatureLike) {
  const props = feature.getProperties() as MareographFeatureProperties;
  return {
    header: [props.name ?? ''],
    featureType: props.calculated ? t('featureList.featureType.calculated') : t('featureList.featureType.mareograph'),
    className: props.calculated ? 'calculated' : 'mareograph',
  };
}

function getMarineWarningDetails(t: TFunction, lang: Lang, feature: FeatureLike) {
  const props = feature.getProperties() as MarineWarningFeatureProperties;
  return {
    header: [`${props.type?.[lang] ?? props.type?.fi} - ${props.number}`],
    featureType: t('featureList.featureType.marinewarning'),
    className: getMarineWarningDataLayerId(props.type),
  };
}

function getSectionDetails(t: TFunction, lang: Lang, feature: FeatureLike) {
  const props = feature.getProperties() as QuayFeatureProperties;
  const quayName = props.quay?.[lang];
  const sectionName = props.name ?? '';
  const headerText = quayName && sectionName ? quayName.concat(' - ', sectionName) : (quayName ?? sectionName);
  return {
    header: [headerText],
    featureType: t('featureList.featureType.section'),
    className: feature.get('featureType'),
  };
}

function getSafetyEquipmentDetails(t: TFunction, lang: Lang, feature: FeatureLike) {
  const props = feature.getProperties() as EquipmentFeatureProperties;
  const dataSource = feature.getProperties().dataSource as FeatureLayerId;
  return {
    header: [`${props.name?.[lang] ?? props.name?.fi} - ${props.id}`],
    featureType: dataSource === 'safetyequipment' ? t('featureList.featureType.safetyequipment') : t('featureList.featureType.safetyequipmentfault'),
    className: dataSource,
  };
}

export function getFeatureDetails(t: TFunction, lang: Lang, feature: FeatureLike): FeatureDetailProperties | undefined {
  const type = feature.get('featureType');
  const props = feature.getProperties();
  const dataSource = props.dataSource as FeatureLayerId;

  /* Selectable feature types for popup */
  switch (type) {
    case 'aisvessel':
      return getAisVesselDetails(t, feature);
    case 'area':
      return {
        header: (props as AreaFeatureProperties).fairways?.map((fairway) => `${fairway.name[lang] ?? fairway.name.fi} ${fairway.fairwayId}`),
        featureType: t('featureList.featureType.area'),
        className: dataSource,
      };
    case 'buoy':
      return { header: [(props as BuoyFeatureProperties).name], featureType: t('featureList.featureType.buoy'), className: type };
    case 'dirway':
      return { header: [(props as DirwayFeatureProperties).name], featureType: t('featureList.featureType.dirway'), className: type };
    case 'harbor':
      return { header: [(props as HarborFeatureProperties).name?.[lang] ?? ''], featureType: t('featureList.featureType.harbor'), className: type };
    case 'line':
      return {
        header: (props as LineFeatureProperties).fairways?.map((fairway) => `${fairway.name[lang] ?? fairway.name.fi} ${fairway.fairwayId}`),
        featureType: t('featureList.featureType.line'),
        className: type,
      };
    case 'mareograph':
      return getMareographDetails(t, feature);
    case 'marinewarning':
      return getMarineWarningDetails(t, lang, feature);
    case 'observation':
      return { header: [(props as ObservationFeatureProperties).name], featureType: t('featureList.featureType.observation'), className: type };
    case 'pilot':
      return {
        header: [t('pilotPlace.header', { val: (props as PilotFeatureProperties).name[lang] })],
        featureType: t('featureList.featureType.pilot'),
        className: type,
      };
    case 'pilotagelimit':
      return {
        header: [t('pilotageLimit.header', { val: (props as PilotageLimitFeatureProperties).numero })],
        featureType: t('featureList.featureType.pilotagelimit'),
        className: type,
      };
    case 'pilotroute':
      return {
        header: [t('pilotRoute.header', { val: (props as PilotRouteFeatureProperties).name })],
        featureType: t('featureList.featureType.pilotroute'),
        className: type,
      };
    case 'quay':
      return { header: [(props as QuayFeatureProperties).quay?.[lang] ?? ''], featureType: t('featureList.featureType.quay'), className: type };
    case 'safetyequipment':
    case 'safetyequipmentfault':
      return getSafetyEquipmentDetails(t, lang, feature);
    case 'section':
      return getSectionDetails(t, lang, feature);
    case 'specialarea15':
      return {
        header: (props as AreaFeatureProperties).fairways?.map((fairway) => `${fairway.name[lang] ?? fairway.name.fi} ${fairway.fairwayId}`),
        featureType: t('featureList.featureType.specialarea15'),
        className: type,
      };
    case 'specialarea2':
      return {
        header: (props as AreaFeatureProperties).fairways?.map((fairway) => `${fairway.name[lang] ?? fairway.name.fi} ${fairway.fairwayId}`),
        featureType: t('featureList.featureType.specialarea2'),
        className: type,
      };
    case 'vtsline':
      return { header: [(props as VtsFeatureProperties).name ?? ''], featureType: t('featureList.featureType.vtsline'), className: type };
    case 'vtspoint':
      return { header: [(props as VtsFeatureProperties).name ?? ''], featureType: t('featureList.featureType.vtspoint'), className: type };
    default:
      return undefined;
  }
}

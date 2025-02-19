import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill } from 'ol/style';
import Map from 'ol/Map';
import { FeatureLike } from 'ol/Feature';
import { getMap } from './DvkMap';
import { Orientation } from '../../graphql/generated';
import { FeatureDataLayerId, FeatureLayerId, MAP } from '../../utils/constants';
import * as olExtent from 'ol/extent';
import { getFairwayArea12Style } from './layerStyles/fairwayArea12Styles';
import { getFairwayArea3456Style } from './layerStyles/fairwayArea3456Styles';
import { getPilotStyle } from './layerStyles/pilotStyles';
import { getDepthStyle } from './layerStyles/depthStyles';
import { getSpeedLimitIconStyle, getSpeedLimitPolygonStyle } from './layerStyles/speedLimitStyles';
import { getNameStyle } from './layerStyles/nameStyles';
import { getSafetyEquipmentStyle } from './layerStyles/safetyEquipmentStyles';
import { getVtsStyle } from './layerStyles/vtsStyles';
import { getCircleStyle } from './layerStyles/circleStyles';
import { getPilotRouteStyle } from './layerStyles/pilotRouteStyles';
import { getPilotageLimitStyle } from './layerStyles/pilotageLimitStyles';
import { getNavigationLine12Style } from './layerStyles/navigationLine12Styles';
import { getNavigationLine3456Style } from './layerStyles/navigationLine3456Styles';
import {
  anchorageAreaIconStyle,
  getSpecialArea9Style,
  getSpecialAreaPolygonStyle,
  getSpecialAreaStyle,
  meetAreaIconStyle,
} from './layerStyles/specialAreaStyles';
import { getHarborStyle } from './layerStyles/harborStyles';
import { getQuayStyle } from './layerStyles/quayStyles';
import { getBoardLineStyle } from './layerStyles/boardLineStyles';

export function getAreaStyle(color: string, width: number, fillColor: string, resolution?: number) {
  let strokeWidth = width;
  if (resolution && resolution > 15) strokeWidth = 0.5;
  if (resolution && resolution > 30) strokeWidth = 0;
  return new Style({
    stroke: new Stroke({
      color: strokeWidth > 0 ? color : fillColor,
      width: strokeWidth,
    }),
    fill: new Fill({
      color: fillColor,
    }),
  });
}

export function getAreaStyleBySource(dataSource: FeatureLayerId, selected: boolean) {
  if (dataSource === 'area12') {
    return getAreaStyle('#EC0E0E', selected ? 1 : 0, selected ? 'rgba(236,14,14,0.5)' : 'rgba(236,14,14,0.3)');
  } else if (dataSource === 'area3456') {
    return getAreaStyle('#207A43', selected ? 1 : 0, selected ? 'rgba(32,122,67,0.5)' : 'rgba(32,122,67,0.3)');
  } else {
    return undefined;
  }
}

export function getLineStyle(color: string, width: number) {
  return new Style({
    stroke: new Stroke({
      color,
      width,
    }),
  });
}

function getArea12BorderLineStyle(feature: FeatureLike) {
  const props = feature.getProperties();
  const a1Props = props.area1Properties;
  const a2Props = props.area2Properties;
  if (!a1Props || !a2Props) {
    return getLineStyle('#EC0E0E', 1);
  } else if (a1Props.typeCode === a2Props.typeCode && a1Props.depth === a2Props.depth) {
    return undefined;
  } else {
    return getLineStyle('#EC0E0E', 0.5);
  }
}

function getSelectedFairwayCardStyle(feature: FeatureLike, resolution: number) {
  const ds = feature.getProperties().dataSource as FeatureDataLayerId | 'area12Borderline';
  const highlighted = !!feature.get('hoverStyle');
  switch (ds) {
    case 'line12':
      return getNavigationLine12Style(feature, resolution, true);
    case 'line3456':
      return getNavigationLine3456Style(feature);
    case 'area12':
      return resolution <= 100 ? getAreaStyleBySource('area12', highlighted) : undefined;
    case 'area12Borderline':
      return resolution <= 100 ? getArea12BorderLineStyle(feature) : undefined;
    case 'area3456':
      return resolution <= 100 ? getAreaStyleBySource('area3456', highlighted) : undefined;
    case 'specialarea2':
    case 'specialarea15':
      return getSpecialAreaStyle(feature, true, highlighted);
    case 'specialarea9':
      return getSpecialArea9Style(feature, resolution);
    case 'boardline12':
      return getBoardLineStyle(feature);
    case 'safetyequipment':
      return getSafetyEquipmentStyle(feature, 1, false);
    case 'harbor':
      return getHarborStyle(feature, resolution, false, 3);
    case 'quay':
      return getQuayStyle(feature, resolution, false);
    case 'circle':
      return getCircleStyle(feature, resolution);
    default:
      return undefined;
  }
}

function getSelectedStyle(feature: FeatureLike, resolution: number) {
  return ['quay', 'section'].includes(feature.getProperties().featureType)
    ? getQuayStyle(feature, resolution, false)
    : getSafetyEquipmentStyle(feature, 1, false);
}

interface FeatureVectorLayerProps {
  map: Map;
  id: FeatureLayerId;
  maxResolution?: number;
  renderBuffer: number;
  style: StyleLike;
  minResolution?: number;
  opacity?: number;
  declutter?: boolean;
  zIndex: number | undefined; //= undefined
  source?: VectorSource<FeatureLike>;
}

function addFeatureVectorLayer({
  map,
  id,
  maxResolution = undefined,
  renderBuffer,
  style,
  minResolution = undefined,
  opacity = 1,
  declutter = false,
  zIndex = undefined,
  source = undefined,
}: FeatureVectorLayerProps) {
  map.addLayer(
    new VectorLayer({
      source: source || new VectorSource<FeatureLike>(),
      declutter,
      style,
      properties: { id },
      maxResolution,
      minResolution,
      renderBuffer,
      updateWhileInteracting: false,
      updateWhileAnimating: false,
      opacity,
      zIndex,
    })
  );
}

export function addAPILayers(map: Map) {
  // Kartan nimistö
  addFeatureVectorLayer({
    map: map,
    id: 'name',
    renderBuffer: 1,
    style: getNameStyle,
    declutter: true,
    zIndex: 106,
  });

  // Kauppamerenkulku
  addFeatureVectorLayer({
    map: map,
    id: 'area12',
    maxResolution: 75,
    renderBuffer: 1,
    style: getFairwayArea12Style,
    zIndex: 202,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'boardline12',
    maxResolution: 75,
    renderBuffer: 1,
    style: getBoardLineStyle,
    zIndex: 204,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'line12',
    renderBuffer: 1,
    style: (feature, resolution) => getNavigationLine12Style(feature, resolution, false),
    declutter: true,
    zIndex: 205,
  });
  // Muu vesiliikenne
  addFeatureVectorLayer({
    map: map,
    id: 'area3456',
    maxResolution: 30,
    renderBuffer: 1,
    style: getFairwayArea3456Style,
    zIndex: 201,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'line3456',
    maxResolution: 75,
    renderBuffer: 1,
    style: getNavigationLine3456Style,
    zIndex: 203,
  });

  // Nopeusrajoitus
  const speedLimitSource = new VectorSource<FeatureLike>({ overlaps: false });
  addFeatureVectorLayer({
    map: map,
    id: 'speedlimit',
    source: speedLimitSource,
    maxResolution: 15,
    renderBuffer: 2,
    style: getSpeedLimitPolygonStyle,
    zIndex: 202,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'speedlimit',
    source: speedLimitSource,
    maxResolution: 15,
    renderBuffer: 2,
    style: getSpeedLimitIconStyle,
    declutter: true,
    zIndex: 305,
  });

  // Ankkurointialue
  const anchorageSource = new VectorSource<FeatureLike>({ overlaps: false });
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea2',
    source: anchorageSource,
    maxResolution: 75,
    renderBuffer: 2,
    style: (feature) => getSpecialAreaPolygonStyle(feature, !!feature.get('hoverStyle')),
    zIndex: 202,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea2',
    source: anchorageSource,
    maxResolution: 75,
    renderBuffer: 2,
    style: anchorageAreaIconStyle,
    declutter: true,
    zIndex: 305,
  });

  // Erikoisalueet
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea9',
    maxResolution: 75,
    renderBuffer: 2,
    style: getSpecialArea9Style,
    zIndex: 202,
  });

  // Kohtaamis- ja ohittamiskieltoalue
  const meetSource = new VectorSource<FeatureLike>({ overlaps: false });
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea15',
    source: meetSource,
    maxResolution: 75,
    renderBuffer: 2,
    style: (feature) => getSpecialAreaPolygonStyle(feature, !!feature.get('hoverStyle')),
    zIndex: 202,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea15',
    source: meetSource,
    maxResolution: 75,
    renderBuffer: 2,
    style: meetAreaIconStyle,
    declutter: true,
    zIndex: 305,
  });

  // Valitun väyläkortin navigointilinjat ja väyläalueet
  addFeatureVectorLayer({
    map: map,
    id: 'selectedfairwaycard',
    renderBuffer: 100,
    style: getSelectedFairwayCardStyle,
    declutter: true,
    zIndex: 303,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'circle',
    maxResolution: 30,
    renderBuffer: 2,
    style: getCircleStyle,
    zIndex: 303,
  });
  // Haraussyvyydet
  addFeatureVectorLayer({
    map: map,
    id: 'depth12',
    maxResolution: 10,
    renderBuffer: 50,
    style: getDepthStyle,
    zIndex: 304,
    declutter: true,
  });
  // Laiturit
  addFeatureVectorLayer({
    map: map,
    id: 'quay',
    maxResolution: 3,
    renderBuffer: 50,
    style: getSelectedStyle,
    declutter: true,
    zIndex: 304,
  });
  // Satamat
  addFeatureVectorLayer({
    map: map,
    id: 'harbor',
    minResolution: 3,
    maxResolution: 300,
    renderBuffer: 50,
    style: getHarborStyle,
    declutter: true,
    zIndex: 305,
  });

  // Turvalaitteet
  addFeatureVectorLayer({
    map: map,
    id: 'safetyequipment',
    renderBuffer: 50,
    style: (feature, resolution) => getSafetyEquipmentStyle(feature, resolution, false),
    zIndex: 380,
  });

  // VTS linjat ja ilmoituspisteet
  addFeatureVectorLayer({
    map: map,
    id: 'vtsline',
    renderBuffer: 2,
    style: (feature) => getVtsStyle(feature, false),
    zIndex: 311,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'vtspoint',
    maxResolution: 75,
    renderBuffer: 50,
    style: (feature) => getVtsStyle(feature, false),
    zIndex: 312,
  });
  // Luotsipaikat
  addFeatureVectorLayer({
    map: map,
    id: 'pilot',
    renderBuffer: 50,
    style: (feature) => getPilotStyle(feature.get('hoverStyle')),
    zIndex: 313,
  });
  //Luotsausreitit
  addFeatureVectorLayer({
    map: map,
    id: 'pilotroute',
    renderBuffer: 50,
    style: getPilotRouteStyle,
    zIndex: 303,
  });
  // Luotsinkäyttölinjat
  addFeatureVectorLayer({
    map: map,
    id: 'pilotagelimit',
    renderBuffer: 15,
    style: getPilotageLimitStyle,
    zIndex: 304,
  });
  // Luotsauskäyttöalueen ulkorajat
  addFeatureVectorLayer({
    map: map,
    id: 'pilotageareaborder',
    renderBuffer: 2,
    style: getLineStyle('#FE7C00', 4),
    zIndex: 104,
  });
}

export function getFittingPadding() {
  const dvkMap = getMap();
  const fitPadding = [100, 50, 50, 50];
  const size = dvkMap.olMap?.getSize() ?? [0, 0];
  const orientationType = dvkMap.getOrientationType();
  if (size[0] && orientationType === Orientation.Portrait) {
    fitPadding[0] = (size[1] - MAP.PRINT.EXPORT_HEIGHT / MAP.PRINT.SCALE) / 2 + 50;
    fitPadding[1] = (size[0] - MAP.PRINT.EXPORT_WIDTH / MAP.PRINT.SCALE) / 2 + 25;
    fitPadding[2] = (size[1] - MAP.PRINT.EXPORT_HEIGHT / MAP.PRINT.SCALE) / 2 + 25;
    fitPadding[3] = (size[0] - MAP.PRINT.EXPORT_WIDTH / MAP.PRINT.SCALE) / 2 + 25;
  }
  if (size[1] && orientationType === Orientation.Landscape) {
    fitPadding[0] = (size[1] - MAP.PRINT.EXPORT_WIDTH / MAP.PRINT.SCALE) / 2 + 50;
    fitPadding[1] = (size[0] - MAP.PRINT.EXPORT_HEIGHT / MAP.PRINT.SCALE) / 2 + 25;
    fitPadding[2] = (size[1] - MAP.PRINT.EXPORT_WIDTH / MAP.PRINT.SCALE) / 2 + 25;
    fitPadding[3] = (size[0] - MAP.PRINT.EXPORT_HEIGHT / MAP.PRINT.SCALE) / 2 + 25;
  }
  return fitPadding;
}

export function fitSelectedFairwayCardOnMap() {
  const dvkMap = getMap();
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
  const selectedFeatures = selectedFairwayCardSource.getFeatures();

  const extent = olExtent.createEmpty();
  for (const feature of selectedFeatures) {
    const geom = feature.getGeometry();
    if (geom) {
      olExtent.extend(extent, geom.getExtent());
    }
  }
  if (!olExtent.isEmpty(extent)) {
    dvkMap.olMap?.getView().fit(extent, { padding: getFittingPadding(), duration: 1000 });
  }
}

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill } from 'ol/style';
import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';
import { getMap } from './DvkMap';
import { FairwayCardPartsFragment, HarborPartsFragment, Maybe, Quay, Section } from '../graphql/generated';
import { FeatureDataLayerId, FeatureLayerId, MAP } from '../utils/constants';
import * as olExtent from 'ol/extent';
import { getFairwayArea12Style } from './layerStyles/fairwayArea12Styles';
import { getFairwayArea3456Style } from './layerStyles/fairwayArea3456Styles';
import { getPilotStyle } from './layerStyles/pilotStyles';
import { getDepthContourStyle, getDepthStyle, getSoundingPointStyle } from './layerStyles/depthStyles';
import { getSpeedLimitIconStyle, getSpeedLimitPolygonStyle } from './layerStyles/speedLimitStyles';
import { getNameStyle } from './layerStyles/nameStyles';
import { getSafetyEquipmentStyle } from './layerStyles/safetyEquipmentStyles';
import { getMarineWarningStyle } from './layerStyles/marineWarningStyles';
import { getMareographStyle } from './layerStyles/mareographStyles';
import { getObservationStyle, getSelectedFairwayCardObservationStyle } from './layerStyles/observationStyles';
import { getBuoyStyle } from './layerStyles/buoyStyles';
import { getFairwayWidthStyle } from './layerStyles/fairwayWidthStyles';
import { getAisVesselLayerStyle } from './layerStyles/aisStyles';
import { GeoJSON } from 'ol/format';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { getVtsStyle } from './layerStyles/vtsStyles';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { getCircleStyle } from './layerStyles/circleStyles';
import { getFairwayAreaBorderFeatures } from '../fairwayareaworker/FairwayAreaUtils';
import { initialState } from '../hooks/dvkReducer';
import { Geometry, Point } from 'ol/geom';
import {
  getFairwayCardPilotRoutes,
  getFairwayCardPilotageLimits,
  getFairwayCardPilotPlaces,
  getFairwayCardSafetyEquipmentFaults,
  getFairwayCardObservations,
  getFairwayCardMareographs,
} from '../utils/fairwayCardUtils';
import { getPilotRouteStyle } from './layerStyles/pilotRouteStyles';
import { getPilotageLimitStyle } from './layerStyles/pilotageLimitStyles';
import { getNavigationLine12Style } from './layerStyles/navigationLine12Styles';
import { getNavigationLine3456Style } from './layerStyles/navigationLine3456Styles';
import { anchorageAreaIconStyle, meetAreaIconStyle, getSpecialAreaPolygonStyle, getSpecialAreaStyle } from './layerStyles/specialAreaStyles';
import { getQuayStyle } from './layerStyles/quayStyles';
import { getHarborStyle } from './layerStyles/harborStyles';
import { getBoardLineStyle } from './layerStyles/boardLineStyles';
import { getDirwayStyle } from './layerStyles/dirwayStyles';

const minResolutionHarbor = 3;

function getAreaStyle(color: string, width: number, fillColor: string, resolution?: number) {
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

export function getAreaStyleBySource(dataSource: FeatureLayerId, selected: boolean, selected2: boolean | undefined) {
  if (dataSource === 'area12') {
    return getAreaStyle('#EC0E0E', selected ? 1 : 0, selected2 ? 'rgba(236,14,14,0.5)' : 'rgba(236,14,14,0.3)');
  } else if (dataSource === 'area3456') {
    return getAreaStyle('#207A43', selected ? 1 : 0, selected2 ? 'rgba(32,122,67,0.5)' : 'rgba(32,122,67,0.3)');
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
      return getNavigationLine3456Style(true);
    case 'area12':
      return resolution <= 100 ? getAreaStyleBySource('area12', highlighted, highlighted) : undefined;
    case 'area12Borderline':
      return resolution <= 100 ? getArea12BorderLineStyle(feature) : undefined;
    case 'area3456':
      return resolution <= 100 ? getAreaStyleBySource('area3456', highlighted, highlighted) : undefined;
    case 'specialarea2':
    case 'specialarea15':
      return getSpecialAreaStyle(feature);
    case 'boardline12':
      return getBoardLineStyle(true);
    case 'safetyequipmentfault':
      return getSafetyEquipmentStyle(feature, resolution, highlighted, true);
    case 'coastalwarning':
    case 'localwarning':
    case 'boaterwarning':
      return getMarineWarningStyle(feature, highlighted);
    case 'harbor':
      return getHarborStyle(feature, resolution, highlighted, minResolutionHarbor);
    case 'circle':
      return getCircleStyle(feature, resolution);
    case 'pilot':
      return getPilotStyle(highlighted);
    case 'pilotagelimit':
      return getPilotageLimitStyle(feature, resolution, highlighted);
    case 'pilotroute':
      return getPilotRouteStyle(feature, resolution, highlighted);
    case 'observation':
      return getSelectedFairwayCardObservationStyle(feature);
    case 'mareograph':
      return getMareographStyle(feature, highlighted, resolution);
    default:
      return undefined;
  }
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
      renderOrder: undefined,
      zIndex,
      visible: initialState.layers.includes(id),
    })
  );
}

function addIceLayer(map: Map) {
  const apiKey = import.meta.env.VITE_APP_FMI_MAP_API_KEY;
  const cloudFrontUrl = import.meta.env.VITE_APP_FRONTEND_DOMAIN_NAME;
  const fmiMapApiUrl = import.meta.env.VITE_APP_FMI_MAP_API_URL;
  let tileUrl;
  if (cloudFrontUrl) {
    tileUrl = `https://${cloudFrontUrl}/fmi/wms`;
  } else if (fmiMapApiUrl) {
    tileUrl = `https://${fmiMapApiUrl}/fmi-apikey/${apiKey}/wms`;
  } else {
    tileUrl = `/fmi/wms`;
  }
  const source = new TileWMS({
    url: tileUrl,
    params: { layers: 'fmi:ice:icechart_iceareas' },
    transition: 0,
    crossOrigin: 'Anonymous',
  });

  const iceLayer = new TileLayer({
    properties: { id: 'ice' },
    source: source,
    zIndex: 102,
    preload: 10,
    opacity: 0.4,
  });

  const fetched = Date.now();
  iceLayer.set('fetchedDate', String(fetched));

  map.addLayer(iceLayer);
}

function getTileUrl(service: 'wfs' | 'wms') {
  const cloudFrontUrl = import.meta.env.VITE_APP_FRONTEND_DOMAIN_NAME;
  const traficomMapApiUrl = import.meta.env.VITE_APP_TRAFICOM_API_URL;
  let tileUrl: string;
  if (cloudFrontUrl) {
    tileUrl = `https://${cloudFrontUrl}/trafiaineistot/inspirepalvelu/rajoitettu/${service}`;
  } else if (traficomMapApiUrl) {
    tileUrl = `https://${traficomMapApiUrl}/inspirepalvelu/rajoitettu/${service}`;
  } else {
    tileUrl = `/trafiaineistot/inspirepalvelu/rajoitettu/${service}`;
  }
  return tileUrl;
}

function addDepthAreaLayer(map: Map) {
  map.addLayer(
    new TileLayer({
      properties: { id: 'deptharea' },
      source: new TileWMS({
        url: getTileUrl('wms'),
        params: { layers: 'DepthArea_A' },
        transition: 0,
        crossOrigin: 'Anonymous',
      }),
      maxResolution: 10,
      zIndex: 101,
      preload: 10,
    })
  );
}

function addDepthContourLayer(map: Map) {
  const vectorSource = new VectorSource<FeatureLike>({
    format: new GeoJSON(),
    url: function (extent) {
      return (
        `${getTileUrl('wfs')}?request=getFeature&typename=DepthContour_L&outputFormat=json&srsName=${MAP.EPSG}&bbox=` +
        extent.join(',') +
        `,urn:ogc:def:crs:${MAP.EPSG}`
      );
    },
    strategy: bboxStrategy,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'depthcontour',
    source: vectorSource,
    maxResolution: 7,
    renderBuffer: 1,
    style: getDepthContourStyle,
    zIndex: 103,
  });
}

function addSoundingPointLayer(map: Map) {
  const vectorSource = new VectorSource<FeatureLike>({
    format: new GeoJSON(),
    url: function (extent) {
      return (
        `${getTileUrl('wfs')}?request=getFeature&typename=Sounding_P&outputFormat=json&srsName=${MAP.EPSG}&bbox=` +
        extent.join(',') +
        `,urn:ogc:def:crs:${MAP.EPSG}`
      );
    },
    strategy: bboxStrategy,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'soundingpoint',
    source: vectorSource,
    maxResolution: 7,
    renderBuffer: 1,
    style: getSoundingPointStyle,
    zIndex: 205,
    declutter: true,
  });
}

function addAisVesselLayer(map: Map, id: FeatureDataLayerId, style: StyleLike, zIndex: number) {
  addFeatureVectorLayer({
    map: map,
    id: id,
    renderBuffer: 5,
    style: style,
    zIndex: zIndex,
  });
}

export function addAPILayers(map: Map) {
  // Jääkartta
  addIceLayer(map);
  // Syvyystiedot
  addDepthContourLayer(map);
  addDepthAreaLayer(map);
  addSoundingPointLayer(map);
  // Kartan nimistö
  addFeatureVectorLayer({
    map: map,
    id: 'name',
    renderBuffer: 1,
    style: getNameStyle,
    declutter: true,
    zIndex: 205,
  });

  // Kauppamerenkulku
  addFeatureVectorLayer({
    map: map,
    id: 'area12',
    maxResolution: 75,
    renderBuffer: 1,
    style: (feature, resolution) => getFairwayArea12Style(feature, resolution, !!feature.get('hoverStyle')),
    zIndex: 202,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'boardline12',
    maxResolution: 75,
    renderBuffer: 1,
    style: getBoardLineStyle(false),
    zIndex: 204,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'line12',
    renderBuffer: 1,
    style: (feature, resolution) => getNavigationLine12Style(feature, resolution, !!feature.get('hoverStyle')),
    declutter: true,
    zIndex: 205,
  });
  // Muu vesiliikenne
  addFeatureVectorLayer({
    map: map,
    id: 'area3456',
    maxResolution: 30,
    renderBuffer: 1,
    style: (feature, resolution) => getFairwayArea3456Style(feature, resolution, !!feature.get('hoverStyle')),
    zIndex: 201,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'line3456',
    maxResolution: 75,
    renderBuffer: 1,
    style: (feature) => getNavigationLine3456Style(!!feature.get('hoverStyle')),
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
    zIndex: 350,
  });

  // Ankkurointialue
  const anchorageSource = new VectorSource<FeatureLike>({ overlaps: false });
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea2',
    source: anchorageSource,
    maxResolution: 75,
    renderBuffer: 2,
    style: getSpecialAreaPolygonStyle,
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
    zIndex: 350,
  });

  // Kohtaamis- ja ohittamiskieltoalue
  const meetSource = new VectorSource<FeatureLike>({ overlaps: false });
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea15',
    source: meetSource,
    maxResolution: 75,
    renderBuffer: 2,
    style: getSpecialAreaPolygonStyle,
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
    zIndex: 350,
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
  // Satamat
  addFeatureVectorLayer({
    map: map,
    id: 'harbor',
    maxResolution: 300,
    renderBuffer: 100,
    style: (feature, resolution) => getHarborStyle(feature, resolution, !!feature.get('hoverStyle')),
    declutter: true,
    zIndex: 305,
  });
  // Turvalaitteet
  addFeatureVectorLayer({
    map: map,
    id: 'safetyequipment',
    renderBuffer: 30,
    style: (feature, resolution) => getSafetyEquipmentStyle(feature, resolution, !!feature.get('hoverStyle'), feature.get('faultListStyle')),
    zIndex: 306,
  });

  // VTS linjat ja ilmoituspisteet
  addFeatureVectorLayer({
    map: map,
    id: 'vtsline',
    renderBuffer: 2,
    style: (feature) => getVtsStyle(feature, !!feature.get('hoverStyle')),
    zIndex: 311,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'vtspoint',
    maxResolution: 75,
    renderBuffer: 50,
    style: (feature) => getVtsStyle(feature, !!feature.get('hoverStyle')),
    zIndex: 312,
  });
  // Luotsipaikat
  addFeatureVectorLayer({
    map: map,
    id: 'pilot',
    renderBuffer: 50,
    style: (feature) => getPilotStyle(!!feature.get('hoverStyle')),
    zIndex: 313,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'fairwaywidth',
    maxResolution: 30,
    renderBuffer: 20,
    style: getFairwayWidthStyle,
    declutter: true,
    zIndex: 314,
  });
  // Turvalaiteviat
  addFeatureVectorLayer({
    map: map,
    id: 'safetyequipmentfault',
    renderBuffer: 30,
    style: (feature, resolution) => getSafetyEquipmentStyle(feature, resolution, feature.get('hoverStyle'), true),
    zIndex: 315,
  });

  // Luotsausreitit
  addFeatureVectorLayer({
    map: map,
    id: 'pilotroute',
    renderBuffer: 50,
    style: (feature, resolution) => getPilotRouteStyle(feature, resolution, feature.get('hoverStyle')),
    zIndex: 303,
  });
  // Luotsinkäyttölinjat
  addFeatureVectorLayer({
    map: map,
    id: 'pilotagelimit',
    renderBuffer: 15,
    style: (feature, resolution) => getPilotageLimitStyle(feature, resolution, feature.get('hoverStyle')),
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

  // Jääväylät
  addFeatureVectorLayer({
    map: map,
    id: 'dirway',
    renderBuffer: 15,
    style: (feature, resolution) => getDirwayStyle(feature, resolution, feature.get('hoverStyle')),
    zIndex: 302,
  });

  // Valitun väyläkortin featuret
  addFeatureVectorLayer({
    map: map,
    id: 'selectedfairwaycard',
    renderBuffer: 100,
    style: getSelectedFairwayCardStyle,
    declutter: true,
    zIndex: 326,
  });

  // Laiturit
  addFeatureVectorLayer({
    map: map,
    id: 'quay',
    renderBuffer: 100,
    style: (feature, resolution) => getQuayStyle(feature, resolution, !!feature.get('hoverStyle')),
    zIndex: 330,
  });

  // Merivaroitukset
  addFeatureVectorLayer({
    map: map,
    id: 'coastalwarning',
    renderBuffer: 50,
    style: (feature) => getMarineWarningStyle(feature, !!feature.get('hoverStyle')),
    declutter: true,
    zIndex: 401,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'localwarning',
    renderBuffer: 50,
    style: (feature) => getMarineWarningStyle(feature, !!feature.get('hoverStyle')),
    declutter: true,
    zIndex: 402,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'boaterwarning',
    renderBuffer: 50,
    style: (feature) => getMarineWarningStyle(feature, !!feature.get('hoverStyle')),
    declutter: true,
    zIndex: 403,
  });

  // Olosuhteet
  addFeatureVectorLayer({
    map: map,
    id: 'buoy',
    renderBuffer: 50,
    style: (feature) => getBuoyStyle(!!feature.get('hoverStyle')),
    declutter: true,
    zIndex: 411,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'observation',
    renderBuffer: 50,
    style: getObservationStyle,
    declutter: true,
    zIndex: 412,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'mareograph',
    renderBuffer: 91,
    style: (feature, resolution) => getMareographStyle(feature, !!feature.get('hoverStyle'), resolution),
    declutter: true,
    zIndex: 413,
  });

  // AIS
  addAisVesselLayer(
    map,
    'aisvesselcargo',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselcargo', feature, resolution, !!feature.get('hoverStyle')),
    501
  );
  addAisVesselLayer(
    map,
    'aisvesseltanker',
    (feature, resolution) => getAisVesselLayerStyle('aisvesseltanker', feature, resolution, !!feature.get('hoverStyle')),
    502
  );
  addAisVesselLayer(
    map,
    'aisvesselpassenger',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselpassenger', feature, resolution, !!feature.get('hoverStyle')),
    503
  );
  addAisVesselLayer(
    map,
    'aisvesselhighspeed',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselhighspeed', feature, resolution, !!feature.get('hoverStyle')),
    504
  );
  addAisVesselLayer(
    map,
    'aisvesseltugandspecialcraft',
    (feature, resolution) => getAisVesselLayerStyle('aisvesseltugandspecialcraft', feature, resolution, !!feature.get('hoverStyle')),
    505
  );
  addAisVesselLayer(
    map,
    'aisvesselpleasurecraft',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselpleasurecraft', feature, resolution, !!feature.get('hoverStyle')),
    506
  );
  addAisVesselLayer(
    map,
    'aisunspecified',
    (feature, resolution) => getAisVesselLayerStyle('aisunspecified', feature, resolution, !!feature.get('hoverStyle')),
    507
  );
}

export function unsetSelectedFairwayCard() {
  const dvkMap = getMap();
  const line12Source = dvkMap.getVectorSource('line12');
  const line3456Source = dvkMap.getVectorSource('line3456');
  const area12Source = dvkMap.getVectorSource('area12');
  const area3456Source = dvkMap.getVectorSource('area3456');
  const quaySource = dvkMap.getVectorSource('quay');
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
  const depthSource = dvkMap.getVectorSource('depth12');
  const specialArea2Source = dvkMap.getVectorSource('specialarea2');
  const specialArea15Source = dvkMap.getVectorSource('specialarea15');
  const boardLine12Source = dvkMap.getVectorSource('boardline12');
  const harborSource = dvkMap.getVectorSource('harbor');
  const circleSource = dvkMap.getVectorSource('circle');
  const safetyEquipmentFaultSource = dvkMap.getVectorSource('safetyequipmentfault');
  const pilotPlaceSource = dvkMap.getVectorSource('pilot');
  const pilotageLimitSource = dvkMap.getVectorSource('pilotagelimit');
  const pilotRouteSource = dvkMap.getVectorSource('pilotroute');
  const oldSelectedFeatures = selectedFairwayCardSource.getFeatures().concat(quaySource.getFeatures());
  for (const feature of oldSelectedFeatures) {
    switch (feature.getProperties().dataSource) {
      case 'line12':
        line12Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        break;
      case 'line3456':
        line3456Source.addFeature(feature);
        break;
      case 'area12':
        area12Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        (depthSource.getFeatureById(feature.getId() as number) as Feature<Geometry>)?.unset('n2000HeightSystem');
        break;
      case 'area3456':
        area3456Source.addFeature(feature);
        break;
      case 'specialarea2':
        specialArea2Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        break;
      case 'specialarea15':
        specialArea15Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        break;
      case 'boardline12':
        boardLine12Source.addFeature(feature);
        break;
      case 'harbor':
        harborSource.addFeature(feature);
        break;
      case 'circle':
        circleSource.addFeature(feature);
        break;
      case 'safetyequipmentfault':
        safetyEquipmentFaultSource.addFeature(feature);
        break;
      case 'pilot':
        pilotPlaceSource.addFeature(feature);
        break;
      case 'pilotagelimit':
        pilotageLimitSource.addFeature(feature);
        break;
      case 'pilotroute':
        pilotRouteSource.addFeature(feature);
        break;
    }
  }
  selectedFairwayCardSource.getFeatures().forEach((f) => f.set('selected', false));
  selectedFairwayCardSource.clear();
  quaySource.clear();
  dvkMap.getFeatureLayer('selectedfairwaycard').setVisible(false);
}

function addQuayFeature(harbor: HarborPartsFragment, quay: Quay, source: VectorSource, format: GeoJSON, showDepth: boolean) {
  const feature = format.readFeature(quay.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
  const depth = quay.sections?.map((s) => s?.depth ?? 0).filter((v) => v !== undefined && v > 0);
  feature.setId(quay.geometry?.coordinates?.join(';'));
  feature.setProperties({
    featureType: 'quay',
    harbor: harbor.id,
    quay: quay.name,
    extraInfo: quay.extraInfo,
    length: quay.length,
    depth,
    showDepth,
    email: harbor.email,
    phoneNumber: harbor.phoneNumber,
    fax: harbor.fax,
    internet: harbor.internet,
  });
  source.addFeature(feature);
}

function addSectionFeature(harbor: HarborPartsFragment, quay: Quay, section: Section, source: VectorSource, format: GeoJSON) {
  const feature = format.readFeature(section.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
  feature.setId(section.geometry?.coordinates?.join(';'));
  feature.setProperties({
    featureType: 'section',
    harbor: harbor.id,
    quay: quay.name,
    extraInfo: quay.extraInfo,
    length: quay.length,
    name: section.name,
    depth: section.depth ? [section.depth] : undefined,
    email: harbor.email,
    phoneNumber: harbor.phoneNumber,
    fax: harbor.fax,
    internet: harbor.internet,
  });
  source.addFeature(feature);
}

function addQuay(harbor: HarborPartsFragment, source: VectorSource) {
  const format = new GeoJSON();
  for (const quay of harbor.quays ?? []) {
    let sectionGeometryMissing = false;
    quay?.sections?.forEach((section) => {
      if (section) {
        if (section.geometry) {
          addSectionFeature(harbor, quay, section, source, format);
        } else {
          sectionGeometryMissing = true;
        }
      }
    });
    if (quay?.geometry) {
      addQuayFeature(harbor, quay, source, format, sectionGeometryMissing);
    }
  }
}

function addHarborFeature(harbor: HarborPartsFragment, source: VectorSource): Feature<Geometry> {
  const format = new GeoJSON();
  const feature = format.readFeature(harbor.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
  feature.setId(harbor.id);
  feature.setProperties({
    featureType: 'harbor',
    dataSource: 'harbor',
    id: harbor.id,
    harborId: harbor.id,
    name: harbor.name ?? harbor.company,
    email: harbor.email,
    phoneNumber: harbor.phoneNumber,
    fax: harbor.fax,
    internet: harbor.internet,
    quays: harbor.quays?.length ?? 0,
    extraInfo: harbor.extraInfo,
    fairwayCards: [],
  });
  source.addFeature(feature);
  return feature;
}

export function setSelectedFairwayCard(fairwayCard: FairwayCardPartsFragment | undefined) {
  const dvkMap = getMap();
  if (fairwayCard) {
    const line12Source = dvkMap.getVectorSource('line12');
    const line3456Source = dvkMap.getVectorSource('line3456');
    const area12Source = dvkMap.getVectorSource('area12');
    const area3456Source = dvkMap.getVectorSource('area3456');
    const quaySource = dvkMap.getVectorSource('quay');
    const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
    const depthSource = dvkMap.getVectorSource('depth12');
    const specialArea2Source = dvkMap.getVectorSource('specialarea2');
    const specialArea15Source = dvkMap.getVectorSource('specialarea15');
    const boardLine12Source = dvkMap.getVectorSource('boardline12');
    const harborSource = dvkMap.getVectorSource('harbor');
    const circleSource = dvkMap.getVectorSource('circle');
    const pilotPlaceSource = dvkMap.getVectorSource('pilot');
    const pilotageLimitSource = dvkMap.getVectorSource('pilotagelimit');
    const safetyEquipmentFaultSource = dvkMap.getVectorSource('safetyequipmentfault');
    const pilotRouteSource = dvkMap.getVectorSource('pilotroute');
    const observationSource = dvkMap.getVectorSource('observation');
    const mareographSource = dvkMap.getVectorSource('mareograph');
    unsetSelectedFairwayCard();

    const fairwayFeatures: Feature[] = [];

    const observationFeatures = observationSource.getFeatures();
    const observations = getFairwayCardObservations(fairwayCard, observationFeatures);
    for (const observation of observations) {
      fairwayFeatures.push(observation);
    }

    for (const fairway of fairwayCard?.fairways || []) {
      for (const line of fairway.navigationLines ?? []) {
        let feature = line12Source.getFeatureById(line.id) as Feature<Geometry>;
        if (feature) {
          line12Source.removeFeature(feature);
          fairwayFeatures.push(feature);
          feature.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
        } else {
          feature = line3456Source.getFeatureById(line.id) as Feature<Geometry>;
          if (feature) {
            line3456Source.removeFeature(feature);
            fairwayFeatures.push(feature);
          }
        }
      }
      for (const area of fairway.areas ?? []) {
        let feature = area12Source.getFeatureById(area.id) as Feature<Geometry>;
        if (feature) {
          area12Source.removeFeature(feature);
          fairwayFeatures.push(feature);
          feature.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
          feature = depthSource.getFeatureById(area.id) as Feature<Geometry>;
          feature?.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
        } else {
          feature = area3456Source.getFeatureById(area.id) as Feature<Geometry>;
          if (feature) {
            area3456Source.removeFeature(feature);
            fairwayFeatures.push(feature);
          }
        }
        if (!feature) {
          feature = specialArea2Source.getFeatureById(area.id) as Feature<Geometry>;
          if (feature) {
            specialArea2Source.removeFeature(feature);
            fairwayFeatures.push(feature);
            feature.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
          }
        }
        if (!feature) {
          feature = specialArea15Source.getFeatureById(area.id) as Feature<Geometry>;
          if (feature) {
            specialArea15Source.removeFeature(feature);
            fairwayFeatures.push(feature);
            feature.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
          }
        }
      }

      for (const line of fairway.boardLines ?? []) {
        const feature = boardLine12Source.getFeatureById(line.id) as Feature<Geometry>;
        if (feature) {
          boardLine12Source.removeFeature(feature);
          fairwayFeatures.push(feature);
        }
      }
      for (const circle of fairway.turningCircles ?? []) {
        const feature = circleSource.getFeatureById(circle.id) as Feature<Geometry>;
        if (feature) {
          circleSource.removeFeature(feature);
          fairwayFeatures.push(feature);
        }
      }
    }

    for (const harbor of fairwayCard?.harbors ?? []) {
      const id = harbor.geometry?.coordinates?.join(';');
      const feature = id ? (harborSource.getFeatureById(id) as Feature<Geometry>) : undefined;
      if (feature) {
        harborSource.removeFeature(feature);
        fairwayFeatures.push(feature);
      }
      addQuay(harbor, quaySource);
    }

    const area12Features = fairwayFeatures.filter((f) => f.get('dataSource') === 'area12');
    const borderLineFeatures = getFairwayAreaBorderFeatures(area12Features);
    borderLineFeatures.forEach((f) => {
      f.set('dataSource', 'area12Borderline', true);
      fairwayFeatures.push(f);
    });

    const safetyEquipmentFaults = getFairwayCardSafetyEquipmentFaults(fairwayCard, safetyEquipmentFaultSource.getFeatures());
    for (const fault of safetyEquipmentFaults) {
      const feature = safetyEquipmentFaultSource.getFeatureById(fault.getId() as number) as Feature<Geometry>;
      if (feature) {
        safetyEquipmentFaultSource.removeFeature(feature);
        fairwayFeatures.push(feature);
      }
    }

    const pilotPlaces = getFairwayCardPilotPlaces(fairwayCard);
    for (const feature of pilotPlaces) {
      pilotPlaceSource.removeFeature(feature);
      fairwayFeatures.push(feature);
    }

    const pilotageLimits = getFairwayCardPilotageLimits(fairwayCard, pilotageLimitSource.getFeatures());
    for (const pilotageLimit of pilotageLimits) {
      const feature = pilotageLimitSource.getFeatureById(pilotageLimit.getId() as number) as Feature<Geometry>;
      if (feature) {
        pilotageLimitSource.removeFeature(feature);
        fairwayFeatures.push(feature);
      }
    }

    const mareographFeatures = mareographSource.getFeatures();
    const mareographs = getFairwayCardMareographs(fairwayCard, mareographFeatures);
    for (const mareograph of mareographs) {
      fairwayFeatures.push(mareograph);
    }

    if (import.meta.env.VITE_APP_ENV !== 'prod') {
      const pilotRouteFeatures = pilotRouteSource.getFeatures();
      const cardRoutes = getFairwayCardPilotRoutes(fairwayCard, pilotRouteFeatures);
      for (const cardRoute of cardRoutes) {
        const feature = pilotRouteSource.getFeatureById(cardRoute.getProperties()?.id) as Feature<Geometry>;
        if (feature) {
          pilotRouteSource.removeFeature(feature);
          fairwayFeatures.push(feature);
        }
      }
    }

    fairwayFeatures.forEach((f) => f.set('selected', true, true));
    selectedFairwayCardSource.addFeatures(fairwayFeatures);

    const extent = olExtent.createEmpty();
    // pilot excludes pilot, pilotagelimit and pilotroute
    const excludedDatasources = ['boardline12', 'safetyequipmentfault', 'pilot', 'observation', 'mareograph'];
    for (const feature of fairwayFeatures) {
      const dataSource = feature.getProperties().dataSource;
      const isWrongDataSource = excludedDatasources.some((source) => dataSource.includes(source));
      if (!isWrongDataSource) {
        const geom = feature.getGeometry();
        if (geom) {
          olExtent.extend(extent, geom.getExtent());
        }
      }
    }
    if (!olExtent.isEmpty(extent)) {
      dvkMap.olMap?.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
    }
  }
  dvkMap.getFeatureLayer('selectedfairwaycard').setVisible(true);
}

export function setSelectedPilotPlace(id?: number | string) {
  const dvkMap = getMap();
  const pilotSource = dvkMap.getVectorSource('selectedfairwaycard');

  for (const f of pilotSource.getFeatures()) {
    f.set('hoverStyle', id && f.getId() === id);
  }
  pilotSource.dispatchEvent('change');
}

export function setSelectedPilotageLimit(id?: number | string) {
  const dvkMap = getMap();
  const pilotageLimitSource = dvkMap.getVectorSource('selectedfairwaycard');

  for (const f of pilotageLimitSource.getFeatures()) {
    f.set('hoverStyle', id && f.getId() === id);
  }
  pilotageLimitSource.dispatchEvent('change');
}

export function setSelectedFairwayArea(id?: number | string) {
  const dvkMap = getMap();
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');

  for (const f of selectedFairwayCardSource.getFeatures()) {
    f.set('hoverStyle', id && ['area', 'specialarea2', 'specialarea15'].includes(f.get('featureType')) && f.getId() === id);
  }
  selectedFairwayCardSource.dispatchEvent('change');
}

export function setSelectedMareograph(id?: number | string) {
  const dvkMap = getMap();
  const mareographSource = dvkMap.getVectorSource('selectedfairwaycard');

  for (const f of mareographSource.getFeatures()) {
    f.set('hoverStyle', id && f.getId() === id);
  }
  mareographSource.dispatchEvent('change');
}

export function setSelectedObservation(id?: number | string) {
  const dvkMap = getMap();
  const observationSource = dvkMap.getVectorSource('selectedfairwaycard');

  for (const f of observationSource.getFeatures()) {
    f.set('hoverStyle', id && f.getId() === id);
  }
  observationSource.dispatchEvent('change');
}

function highlightFeatures(source: VectorSource, featureTypes: string[], id: string | number, idProp: string, selected: boolean) {
  source.forEachFeature((f) => {
    if (id === f.get(idProp) && featureTypes.includes(f.get('featureType'))) {
      f.set('hoverStyle', selected, true);
    }
  });
  source.dispatchEvent('change');
}

export function setSelectedHarbor(id: string, selected: boolean) {
  const dvkMap = getMap();
  const resolution = dvkMap.olMap?.getView().getResolution() ?? 0;
  if (resolution < minResolutionHarbor) {
    // Harbor not visible, highlight quays
    const quaySource = dvkMap.getVectorSource('quay');
    highlightFeatures(quaySource, ['quay', 'section'], id, 'harbor', selected);
  } else {
    const fairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
    highlightFeatures(fairwayCardSource, ['harbor'], id, 'harborId', selected);
  }
}

export function setSelectedQuay(quay: Maybe<Quay>) {
  const dvkMap = getMap();
  const quaySource = dvkMap.getVectorSource('quay');
  const ids = [];
  if (quay?.geometry?.coordinates) {
    ids.push(quay.geometry.coordinates.join(';'));
  }
  if (quay?.sections) {
    quay.sections.forEach((s) => {
      if (s?.geometry?.coordinates) {
        ids.push(s.geometry.coordinates.join(';'));
      }
    });
  }
  for (const f of quaySource.getFeatures()) {
    if (['quay', 'section'].includes(f.get('featureType'))) {
      f.set('hoverStyle', ids.includes(f.getId() as string), true);
    } else {
      f.set('hoverStyle', false, true);
    }
  }
  quaySource.dispatchEvent('change');
}

export function setSelectedSafetyEquipment(id: number, selected: boolean) {
  const dvkMap = getMap();
  const faultSource = dvkMap.getVectorSource('safetyequipmentfault');
  const fairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');

  highlightFeatures(faultSource, ['safetyequipment', 'safetyequipmentfault'], id, 'id', selected);
  highlightFeatures(fairwayCardSource, ['safetyequipment', 'safetyequipmentfault'], id, 'id', selected);
}

export function setSelectedPilotRoute(id: number, selected: boolean) {
  const dvkMap = getMap();
  const pilotRouteSource = dvkMap.getVectorSource('pilotroute');
  const fairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');

  highlightFeatures(pilotRouteSource, ['pilotroute'], id, 'id', selected);
  highlightFeatures(fairwayCardSource, ['pilotroute'], id, 'id', selected);
}

export function setSelectedHarborPreview(harbor: HarborPartsFragment) {
  const dvkMap = getMap();
  const harborLayer = dvkMap.getFeatureLayer('harbor');
  const fairwayCardLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
  const quaySource = dvkMap.getVectorSource('quay');

  fairwayCardLayer.setVisible(true);
  const harborFeature = addHarborFeature(harbor, fairwayCardLayer.getSource() as VectorSource);
  addQuay(harbor, quaySource);
  harborLayer.setVisible(false);

  dvkMap.olMap?.getView().animate({ center: (harborFeature.getGeometry() as Point).getCoordinates() }, { resolution: 2 });
}

export function unsetSelectedHarborPreview() {
  const dvkMap = getMap();
  const harborLayer = dvkMap.getFeatureLayer('harbor');
  const fairwayCardLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
  const quaySource = dvkMap.getVectorSource('quay');

  quaySource.clear();
  (fairwayCardLayer.getSource() as VectorSource).clear();
  fairwayCardLayer.setVisible(false);
  harborLayer.setVisible(true);
}

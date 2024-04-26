import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill, Icon } from 'ol/style';
import Map from 'ol/Map';
import quayIcon from '../theme/img/dock_icon.svg';
import quayIconActive from '../theme/img/dock_icon_active.svg';
import quaySectionIcon from '../theme/img/quay_section.svg';
import quaySectionIconActive from '../theme/img/quay_section_active.svg';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';
import Feature, { FeatureLike } from 'ol/Feature';
import { getMap } from './DvkMap';
import { FairwayCardPartsFragment, HarborPartsFragment, Maybe, Quay, Section } from '../graphql/generated';
import { FeatureDataLayerId, FeatureLayerId, Lang, MAP } from '../utils/constants';
import { HarborFeatureProperties, QuayFeatureProperties } from './features';
import * as olExtent from 'ol/extent';
import anchorage from '../theme/img/ankkurointialue.svg';
import meet from '../theme/img/kohtaamiskielto_ikoni.svg';
import specialarea from '../theme/img/erityisalue_tausta.svg';
import specialareaSelected from '../theme/img/erityisalue_tausta_active.svg';
import specialareaSelected2 from '../theme/img/erityisalue_tausta_active2.svg';
import Polygon from 'ol/geom/Polygon';
import { getFairwayArea12Style } from './layerStyles/fairwayArea12Styles';
import { getFairwayArea3456Style } from './layerStyles/fairwayArea3456Styles';
import { getPilotStyle } from './layerStyles/pilotStyles';
import { getDepthContourStyle, getDepthStyle, getSoundingPointStyle } from './layerStyles/depthStyles';
import { getSpeedLimitStyle } from './layerStyles/speedLimitStyles';
import { getNameStyle } from './layerStyles/nameStyles';
import { getSafetyEquipmentStyle } from './layerStyles/safetyEquipmentStyles';
import { getMarineWarningStyle } from './layerStyles/marineWarningStyles';
import { getMareographStyle } from './layerStyles/mareographStyles';
import { getObservationStyle } from './layerStyles/observationStyles';
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
  getPilotPlacesByFairwayCardId,
  getPilotageLimitsByFairways,
  getSafetyEquipmentFaultsByFairwayCardId,
} from '../utils/fairwayCardUtils';
import { getPilotRouteStyle } from './layerStyles/pilotRouteStyles';
import { getPilotageLimitStyle } from './layerStyles/pilotageLimitStyles';
import { getNavigationLine12Style } from './layerStyles/navigationLine12Styles';
import { getNavigationLine3456Style } from './layerStyles/navigationLine3456Styles';

const specialAreaImage = new Image();
specialAreaImage.src = specialarea;
const specialAreaSelectedImage = new Image();
specialAreaSelectedImage.src = specialareaSelected;
const specialAreaSelectedImage2 = new Image();
specialAreaSelectedImage2.src = specialareaSelected2;
const minResolutionHarbor = 3;

export function getSpecialAreaStyle(feature: FeatureLike, color: string, width: number, selected: boolean, selected2 = false) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  let gradient;
  if (selected2) {
    gradient = context.createPattern(specialAreaSelectedImage2, 'repeat');
  } else {
    gradient = context.createPattern(selected ? specialAreaSelectedImage : specialAreaImage, 'repeat');
  }
  return [
    new Style({
      image: new Icon({
        src: feature.getProperties().typeCode === 2 ? anchorage : meet,
        opacity: 1,
      }),
      zIndex: 100,
      geometry: function (feat) {
        const geometry = feat.getGeometry() as Polygon;
        return geometry.getInteriorPoint();
      },
    }),
    new Style({
      stroke: new Stroke({
        color,
        width,
      }),
      zIndex: 99,
      fill: new Fill({
        color: gradient,
      }),
    }),
  ];
}

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

export function getBoardLineStyle(color: string, width: number) {
  return new Style({
    stroke: new Stroke({
      color,
      width,
      lineDash: [15, 10],
    }),
    zIndex: 202,
  });
}

function getSectionStyle(selected: boolean, props: QuayFeatureProperties) {
  const color = selected ? '#0064AF' : '#000000';
  const depth = props.depth ? `${props.depth[0]} m` : '';
  const image = new Icon({
    src: quaySectionIcon,
    anchor: [0.5, 19],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const activeImage = new Icon({
    src: quaySectionIconActive,
    anchor: [0.5, 19],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });

  return new Style({
    image: selected ? activeImage : image,
    text: new Text({
      font: '14px "Exo2"',
      placement: 'line',
      offsetY: -29,
      text: depth,
      fill: new Fill({
        color: color,
      }),
      stroke: new Stroke({
        width: 2,
        color: '#ffffff',
      }),
    }),
  });
}

export function getQuayStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  if (resolution > 3) {
    return undefined;
  }

  const featureType = feature.get('featureType');
  const props = feature.getProperties() as QuayFeatureProperties;
  if (featureType === 'section') {
    return getSectionStyle(selected, props);
  }

  const dvkMap = getMap();
  const lang = dvkMap.i18n.resolvedLanguage as Lang;
  const quayName = props.quay?.[lang] ?? '';
  const depthText =
    props.depth && props.depth.length > 0 ? `${props.depth.map((d) => dvkMap.t('popup.quay.number', { val: d })).join(' m / ')} m` : '';

  const image = new Icon({
    src: quayIcon,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const activeImage = new Icon({
    src: quayIconActive,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const labelFill = new Fill({
    color: selected ? '#0064AF' : '#000000',
  });
  const labelStroke = new Stroke({
    width: 3,
    color: '#ffffff',
  });
  const labelZIndex = selected ? 10 : 1;

  const quayStyle = [
    new Style({
      image: selected ? activeImage : image,
      text: new Text({
        font: 'bold 18px "Exo2"',
        placement: 'line',
        offsetY: props.showDepth ? -72 : -55,
        text: quayName,
        fill: labelFill,
        stroke: labelStroke,
      }),
      zIndex: labelZIndex,
    }),
    new Style({
      image: new CircleStyle({
        radius: 20,
        displacement: [0, 20],
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
      }),
      zIndex: selected ? 11 : 2,
    }),
  ];

  if (props.showDepth) {
    quayStyle.push(
      new Style({
        text: new Text({
          font: '12px "Exo2"',
          placement: 'line',
          offsetY: -53,
          text: depthText,
          fill: labelFill,
          stroke: labelStroke,
        }),
        zIndex: labelZIndex,
      })
    );
  }

  return quayStyle;
}

export function getHarborStyle(feature: FeatureLike, resolution: number, selected = false, minResolution = 0) {
  if (minResolution && resolution < minResolution) {
    return undefined;
  }

  const image = new Icon({
    src: quayIcon,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const activeImage = new Icon({
    src: quayIconActive,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const props = feature.getProperties() as HarborFeatureProperties;
  let text;
  const dvkMap = getMap();
  if (props.name) {
    text = props.name[dvkMap.i18n.resolvedLanguage as Lang] as string;
  } else {
    text = '';
  }
  return new Style({
    image: selected ? activeImage : image,
    text: new Text({
      font: `bold ${resolution < 50 ? '18' : '13'}px "Exo2"`,
      placement: 'line',
      offsetY: -55,
      text,
      fill: new Fill({
        color: selected ? '#0064AF' : '#000000',
      }),
      stroke: new Stroke({
        width: 3,
        color: '#ffffff',
      }),
    }),
    zIndex: selected ? 10 : 1,
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
      return getSpecialAreaStyle(feature, '#C57A11', 2, true, highlighted);
    case 'boardline12':
      return getBoardLineStyle('#000000', 1);
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
    default:
      return undefined;
  }
}

interface FeatureVectorLayerProps {
  map: Map;
  id: FeatureLayerId;
  maxResolution: number | undefined;
  renderBuffer: number;
  style: StyleLike;
  minResolution: number | undefined; //= undefined
  opacity: number; // = 1
  declutter: boolean; // = false
  zIndex: number | undefined; //= undefined
}

function addFeatureVectorLayer({
  map,
  id,
  maxResolution,
  renderBuffer,
  style,
  minResolution = undefined,
  opacity = 1,
  declutter = false,
  zIndex = undefined,
}: FeatureVectorLayerProps) {
  map.addLayer(
    new VectorLayer({
      source: new VectorSource(),
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
  map.addLayer(
    new TileLayer({
      properties: { id: 'ice' },
      source: new TileWMS({
        url: tileUrl,
        params: { layers: 'fmi:ice:icechart_iceareas' },
        transition: 0,
        crossOrigin: 'Anonymous',
      }),
      zIndex: 102,
      preload: 10,
      opacity: 0.4,
    })
  );
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

function addDepthContourLayer(map: Map) {
  const vectorSource = new VectorSource({
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
  const layer = new VectorLayer({
    properties: { id: 'depthcontour' },
    source: vectorSource,
    style: getDepthContourStyle,
    maxResolution: 7,
    renderBuffer: 1,
    zIndex: 103,
  });
  map.addLayer(layer);
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

function addSoundingPointLayer(map: Map) {
  const vectorSource = new VectorSource({
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
  const layer = new VectorLayer({
    properties: { id: 'soundingpoint' },
    source: vectorSource,
    style: getSoundingPointStyle,
    maxResolution: 7,
    renderBuffer: 1,
    zIndex: 305,
  });
  map.addLayer(layer);
}

function addAisVesselLayer(map: Map, id: FeatureDataLayerId, style: StyleLike, zIndex: number) {
  addFeatureVectorLayer({
    map: map,
    id: id,
    maxResolution: undefined,
    renderBuffer: 5,
    style: style,
    minResolution: undefined,
    opacity: 1,
    declutter: false,
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
    maxResolution: undefined,
    renderBuffer: 1,
    style: getNameStyle,
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 102,
  });

  // Kauppamerenkulku
  addFeatureVectorLayer({
    map: map,
    id: 'area12',
    maxResolution: 75,
    renderBuffer: 1,
    style: (feature, resolution) => getFairwayArea12Style(feature, resolution, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 201,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'boardline12',
    maxResolution: 75,
    renderBuffer: 1,
    style: getBoardLineStyle('#000000', 0.5),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 202,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'line12',
    maxResolution: undefined,
    renderBuffer: 1,
    style: (feature, resolution) => getNavigationLine12Style(feature, resolution, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 203,
  });
  // Muu vesiliikenne
  addFeatureVectorLayer({
    map: map,
    id: 'area3456',
    maxResolution: 30,
    renderBuffer: 1,
    style: (feature, resolution) => getFairwayArea3456Style(feature, resolution, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 204,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'line3456',
    maxResolution: 75,
    renderBuffer: 1,
    style: (feature) => getNavigationLine3456Style(!!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 205,
  });

  // Nopeusrajoitus
  addFeatureVectorLayer({
    map: map,
    id: 'speedlimit',
    maxResolution: 15,
    renderBuffer: 2,
    style: getSpeedLimitStyle,
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 301,
  });
  // Ankkurointialue
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea2',
    maxResolution: 75,
    renderBuffer: 2,
    style: (feature) => getSpecialAreaStyle(feature, '#C57A11', 2, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 302,
  });
  // Kohtaamis- ja ohittamiskieltoalue
  addFeatureVectorLayer({
    map: map,
    id: 'specialarea15',
    maxResolution: 75,
    renderBuffer: 2,
    style: (feature) => getSpecialAreaStyle(feature, '#C57A11', 2, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 302,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'circle',
    maxResolution: 30,
    renderBuffer: 2,
    style: getCircleStyle,
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 303,
  });
  // Haraussyvyydet
  addFeatureVectorLayer({
    map: map,
    id: 'depth12',
    maxResolution: 10,
    renderBuffer: 50,
    style: getDepthStyle,
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 304,
  });
  // Laiturit
  addFeatureVectorLayer({
    map: map,
    id: 'quay',
    maxResolution: undefined,
    renderBuffer: 100,
    style: (feature, resolution) => getQuayStyle(feature, resolution, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 304,
  });
  // Satamat
  addFeatureVectorLayer({
    map: map,
    id: 'harbor',
    maxResolution: 300,
    renderBuffer: 100,
    style: (feature, resolution) => getHarborStyle(feature, resolution, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 305,
  });
  // Turvalaitteet
  addFeatureVectorLayer({
    map: map,
    id: 'safetyequipment',
    maxResolution: undefined,
    renderBuffer: 30,
    style: (feature, resolution) => getSafetyEquipmentStyle(feature, resolution, !!feature.get('hoverStyle'), feature.get('faultListStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 306,
  });
  // Olosuhteet
  addFeatureVectorLayer({
    map: map,
    id: 'buoy',
    maxResolution: undefined,
    renderBuffer: 50,
    style: (feature) => getBuoyStyle(!!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 307,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'observation',
    maxResolution: undefined,
    renderBuffer: 50,
    style: (feature) => getObservationStyle(!!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 308,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'mareograph',
    maxResolution: undefined,
    renderBuffer: 91,
    style: (feature, resolution) => getMareographStyle(feature, !!feature.get('hoverStyle'), resolution),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 309,
  });
  // Merivaroitukset
  addFeatureVectorLayer({
    map: map,
    id: 'coastalwarning',
    maxResolution: undefined,
    renderBuffer: 50,
    style: (feature) => getMarineWarningStyle(feature, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 310,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'localwarning',
    maxResolution: undefined,
    renderBuffer: 50,
    style: (feature) => getMarineWarningStyle(feature, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 310,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'boaterwarning',
    maxResolution: undefined,
    renderBuffer: 50,
    style: (feature) => getMarineWarningStyle(feature, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 310,
  });
  // VTS linjat ja ilmoituspisteet
  addFeatureVectorLayer({
    map: map,
    id: 'vtsline',
    maxResolution: undefined,
    renderBuffer: 2,
    style: (feature) => getVtsStyle(feature, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 311,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'vtspoint',
    maxResolution: 75,
    renderBuffer: 50,
    style: (feature) => getVtsStyle(feature, !!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 312,
  });
  // Luotsipaikat
  addFeatureVectorLayer({
    map: map,
    id: 'pilot',
    maxResolution: undefined,
    renderBuffer: 50,
    style: (feature) => getPilotStyle(!!feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 313,
  });
  addFeatureVectorLayer({
    map: map,
    id: 'fairwaywidth',
    maxResolution: 30,
    renderBuffer: 20,
    style: getFairwayWidthStyle,
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 314,
  });
  // Turvalaiteviat
  addFeatureVectorLayer({
    map: map,
    id: 'safetyequipmentfault',
    maxResolution: undefined,
    renderBuffer: 30,
    style: (feature, resolution) => getSafetyEquipmentStyle(feature, resolution, feature.get('hoverStyle'), true),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 315,
  });

  // AIS
  addAisVesselLayer(
    map,
    'aisvesselcargo',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselcargo', feature, resolution, !!feature.get('hoverStyle')),
    316
  );
  addAisVesselLayer(
    map,
    'aisvesseltanker',
    (feature, resolution) => getAisVesselLayerStyle('aisvesseltanker', feature, resolution, !!feature.get('hoverStyle')),
    317
  );
  addAisVesselLayer(
    map,
    'aisvesselpassenger',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselpassenger', feature, resolution, !!feature.get('hoverStyle')),
    318
  );
  addAisVesselLayer(
    map,
    'aisvesselhighspeed',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselhighspeed', feature, resolution, !!feature.get('hoverStyle')),
    319
  );
  addAisVesselLayer(
    map,
    'aisvesseltugandspecialcraft',
    (feature, resolution) => getAisVesselLayerStyle('aisvesseltugandspecialcraft', feature, resolution, !!feature.get('hoverStyle')),
    320
  );
  addAisVesselLayer(
    map,
    'aisvesselpleasurecraft',
    (feature, resolution) => getAisVesselLayerStyle('aisvesselpleasurecraft', feature, resolution, !!feature.get('hoverStyle')),
    322
  );
  addAisVesselLayer(
    map,
    'aisunspecified',
    (feature, resolution) => getAisVesselLayerStyle('aisunspecified', feature, resolution, !!feature.get('hoverStyle')),
    324
  );

  // Luotsausreitit
  addFeatureVectorLayer({
    map: map,
    id: 'pilotroute',
    maxResolution: undefined,
    renderBuffer: 50,
    style: (feature, resolution) => getPilotRouteStyle(feature, resolution, feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 325,
  });
  // Luotsinkäyttölinjat
  addFeatureVectorLayer({
    map: map,
    id: 'pilotagelimit',
    maxResolution: undefined,
    renderBuffer: 15,
    style: (feature, resolution) => getPilotageLimitStyle(feature, resolution, feature.get('hoverStyle')),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 304,
  });
  // Luotsauskäyttöalueen ulkorajat
  addFeatureVectorLayer({
    map: map,
    id: 'pilotageareaborder',
    maxResolution: undefined,
    renderBuffer: 2,
    style: getLineStyle('#FE7C00', 4),
    minResolution: undefined,
    opacity: 1,
    declutter: false,
    zIndex: 104,
  });
  // Valitun väyläkortin featuret (jätetään aina ylimmäksi)
  addFeatureVectorLayer({
    map: map,
    id: 'selectedfairwaycard',
    maxResolution: undefined,
    renderBuffer: 100,
    style: getSelectedFairwayCardStyle,
    minResolution: undefined,
    opacity: 1,
    declutter: true,
    zIndex: 326,
  });
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
  selectedFairwayCardSource.getFeatures().forEach((f) => f.set('selected', false, true));
  selectedFairwayCardSource.clear();
  quaySource.clear();
}

function addQuayFeature(harbor: HarborPartsFragment, quay: Quay, source: VectorSource, format: GeoJSON, showDepth: boolean) {
  const feature = format.readFeature(quay.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG }) as Feature<Geometry>;
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
  const feature = format.readFeature(section.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG }) as Feature<Geometry>;
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
  const feature = format.readFeature(harbor.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG }) as Feature<Geometry>;
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
    unsetSelectedFairwayCard();

    const fairwayFeatures: Feature[] = [];
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

    const safetyEquipmentFaults = getSafetyEquipmentFaultsByFairwayCardId(fairwayCard.id);
    for (const fault of safetyEquipmentFaults) {
      const feature = safetyEquipmentFaultSource.getFeatureById(fault.equipmentId) as Feature<Geometry>;
      if (feature) {
        safetyEquipmentFaultSource.removeFeature(feature);
        fairwayFeatures.push(feature);
      }
    }

    const pilotPlaces = getPilotPlacesByFairwayCardId(String(fairwayCard.name.fi));
    for (const feature of pilotPlaces) {
      pilotPlaceSource.removeFeature(feature);
      fairwayFeatures.push(feature);
    }

    // no feature id set for pilotage limits, so has to be done this way around
    const pilotageLimits = getPilotageLimitsByFairways(fairwayCard.fairways, true);
    for (const f of pilotageLimitSource.getFeatures()) {
      const pilotageNumber = f.getProperties().numero;
      for (const limit of pilotageLimits) {
        if (limit.numero === pilotageNumber) {
          pilotageLimitSource.removeFeature(f);
          fairwayFeatures.push(f);
        }
      }
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
    const excludedDatasources = ['boardline12', 'safetyequipmentfault', 'pilot'];
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

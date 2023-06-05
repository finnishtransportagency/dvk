import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill, Icon } from 'ol/style';
import Map from 'ol/Map';
import quayIcon from '../theme/img/dock_icon.svg';
import quayIconActive from '../theme/img/dock_icon_active.svg';
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
import { GeoJSON } from 'ol/format';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import VectorImageLayer from 'ol/layer/VectorImage';
import { getVtsStyle } from './layerStyles/vtsStyles';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { getCircleStyle } from './layerStyles/circleStyles';

const specialAreaImage = new Image();
specialAreaImage.src = specialarea;
const specialAreaSelectedImage = new Image();
specialAreaSelectedImage.src = specialareaSelected;
const specialAreaSelectedImage2 = new Image();
specialAreaSelectedImage2.src = specialareaSelected2;

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

export function getQuayStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  if (resolution > 3) {
    return undefined;
  }
  if (feature.get('hoverStyle')) {
    selected = true;
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
  const props = feature.getProperties() as QuayFeatureProperties;
  let text;
  const dvkMap = getMap();
  if (props.name && props.depth) {
    text = `${props.name} ${props.depth?.map((d) => dvkMap.t('popup.quay.number', { val: d })).join(' m / ')} m`;
  } else if (props.depth) {
    text = `${props.depth?.map((d) => dvkMap.t('popup.quay.number', { val: d })).join(' m / ')} m`;
  } else if (props.name) {
    text = props.name;
  } else {
    text = '';
  }
  return [
    new Style({
      image: selected ? activeImage : image,
      text: new Text({
        font: 'bold 18px "Exo2"',
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
}

export function getHarborStyle(feature: FeatureLike, resolution: number, minResolution = 0, selected = false) {
  if (minResolution && resolution < minResolution) {
    return undefined;
  }

  if (feature.get('hoverStyle')) {
    selected = true;
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

function getSelectedFairwayCardStyle(feature: FeatureLike, resolution: number) {
  const ds = feature.getProperties().dataSource as FeatureDataLayerId;
  if (ds === 'line12') {
    return getLineStyle('#0000FF', 2);
  } else if (ds === 'line3456') {
    return getLineStyle('#0000FF', 2);
  } else if (ds === 'area12' && resolution <= 100) {
    if (feature.get('hoverStyle')) {
      return getAreaStyle('#EC0E0E', 1, 'rgba(236,14,14,0.5)');
    } else {
      return getAreaStyle('#EC0E0E', 1, 'rgba(236,14,14,0.3)');
    }
  } else if (ds === 'area3456' && resolution <= 100) {
    return getAreaStyle('#207A43', 1, 'rgba(32,122,67,0.3)');
  } else if (ds === 'specialarea') {
    if (feature.get('hoverStyle')) {
      return getSpecialAreaStyle(feature, '#C57A11', 2, true, true);
    } else {
      return getSpecialAreaStyle(feature, '#C57A11', 2, true, false);
    }
  } else if (ds === 'boardline12') {
    return getBoardLineStyle('#000000', 1);
  } else if (ds === 'safetyequipment') {
    return getSafetyEquipmentStyle(feature, 1, false);
  } else if (ds === 'marinewarning') {
    return getMarineWarningStyle(feature, false);
  } else if (ds === 'harbor') {
    return getHarborStyle(feature, resolution, 3);
  } else if (ds === 'circle') {
    return getCircleStyle(feature, resolution);
  } else {
    return undefined;
  }
}

function addFeatureVectorLayer(
  map: Map,
  id: FeatureLayerId,
  maxResolution: number | undefined,
  renderBuffer: number,
  style: StyleLike,
  minResolution: number | undefined = undefined,
  opacity = 1,
  declutter = false,
  zIndex: number | undefined = undefined
) {
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
    })
  );
}

function addFeatureVectorImageLayer(
  map: Map,
  id: FeatureLayerId,
  maxResolution: number | undefined,
  renderBuffer: number,
  style: StyleLike,
  minResolution: number | undefined = undefined,
  opacity = 1,
  declutter = false,
  zIndex: number | undefined = undefined
) {
  map.addLayer(
    new VectorImageLayer({
      properties: { id },
      source: new VectorSource(),
      declutter,
      maxResolution,
      minResolution,
      renderBuffer,
      style,
      opacity,
      imageRatio: 2,
      renderOrder: undefined,
      zIndex,
    })
  );
}

function addIceLayer(map: Map) {
  const apiKey = process.env.REACT_APP_FMI_MAP_API_KEY;
  const cloudFrontUrl = process.env.REACT_APP_FRONTEND_DOMAIN_NAME;
  const fmiMapApiUrl = process.env.REACT_APP_FMI_MAP_API_URL;
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
      zIndex: 101,
      preload: 10,
      opacity: 0.4,
    })
  );
}

function getTileUrl(service: 'wfs' | 'wms') {
  const cloudFrontUrl = process.env.REACT_APP_FRONTEND_DOMAIN_NAME;
  const traficomMapApiUrl = process.env.REACT_APP_TRAFICOM_API_URL;
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
      zIndex: 102,
      preload: 10,
    })
  );
}

export function addAPILayers(map: Map) {
  // Jääkartta
  addIceLayer(map);
  addDepthContourLayer(map);
  addDepthAreaLayer(map);
  // Kartan nimistö
  addFeatureVectorLayer(map, 'name', undefined, 1, getNameStyle, undefined, 1, true, 102);

  // Kauppamerenkulku
  addFeatureVectorImageLayer(
    map,
    'area12',
    75,
    1,
    (feature, resolution) => getAreaStyle('#EC0E0E', 1, 'rgba(236, 14, 14, 0.1)', resolution),
    undefined,
    1,
    false,
    201
  );
  addFeatureVectorImageLayer(map, 'boardline12', 75, 1, getBoardLineStyle('#000000', 0.5), undefined, 1, false, 202);
  addFeatureVectorImageLayer(map, 'line12', undefined, 1, getLineStyle('#0000FF', 1), undefined, 1, false, 203);
  // Muu vesiliikenne
  addFeatureVectorImageLayer(
    map,
    'area3456',
    30,
    1,
    (feature, resolution) => getAreaStyle('#207A43', 1, 'rgba(32, 122, 67, 0.1)', resolution),
    undefined,
    1,
    false,
    204
  );
  addFeatureVectorImageLayer(map, 'line3456', 75, 1, getLineStyle('#0000FF', 1), undefined, 1, false, 205);

  // Nopeusrajoitus
  addFeatureVectorLayer(map, 'speedlimit', 15, 2, getSpeedLimitStyle, undefined, 1, true, 301);
  // Ankkurointialue, Kohtaamis- ja ohittamiskieltoalue
  addFeatureVectorLayer(map, 'specialarea', 75, 2, (feature) => getSpecialAreaStyle(feature, '#C57A11', 2, false), undefined, 1, true, 302);
  addFeatureVectorLayer(map, 'circle', 30, 2, (feature, resolution) => getCircleStyle(feature, resolution), undefined, 1, false, 302);
  // Valitun väyläkortin navigointilinjat ja väyläalueet
  addFeatureVectorLayer(map, 'selectedfairwaycard', undefined, 100, getSelectedFairwayCardStyle, undefined, 1, true, 303);
  // Haraussyvyydet
  addFeatureVectorLayer(map, 'depth12', 10, 50, getDepthStyle, undefined, 1, false, 304);
  // Laiturit
  addFeatureVectorLayer(map, 'quay', 300, 50, (feature, resolution) => getQuayStyle(feature, resolution, false), undefined, 1, false, 304);
  // Satamat
  addFeatureVectorLayer(map, 'harbor', 300, 50, getHarborStyle, undefined, 1, true, 305);

  addFeatureVectorLayer(map, 'soundingpoint', 7, 1, getSoundingPointStyle, undefined, 1, false, 305);

  // Turvalaitteet
  addFeatureVectorLayer(
    map,
    'safetyequipment',
    undefined,
    50,
    (feature, resolution) => getSafetyEquipmentStyle(feature, resolution, false),
    undefined,
    1,
    false,
    306
  );

  addFeatureVectorLayer(map, 'buoy', undefined, 50, () => getBuoyStyle(false), undefined, 1, true, 307);
  addFeatureVectorLayer(map, 'observation', undefined, 50, () => getObservationStyle(false), undefined, 1, true, 308);
  addFeatureVectorLayer(
    map,
    'mareograph',
    undefined,
    91,
    (feature, resolution) => getMareographStyle(feature, false, resolution),
    undefined,
    1,
    true,
    309
  );
  addFeatureVectorLayer(map, 'marinewarning', undefined, 50, (feature) => getMarineWarningStyle(feature, false), undefined, 1, true, 310);

  // VTS linjat ja ilmoituspisteet
  addFeatureVectorLayer(map, 'vtsline', undefined, 2, (feature) => getVtsStyle(feature, false), undefined, 1, false, 311);
  addFeatureVectorLayer(map, 'vtspoint', 75, 50, (feature) => getVtsStyle(feature, false), undefined, 1, false, 312);
  // Luotsipaikat
  addFeatureVectorLayer(map, 'pilot', undefined, 50, (feature) => getPilotStyle(feature.get('hoverStyle')), undefined, 1, false, 313);
  addFeatureVectorLayer(map, 'fairwaywidth', 30, 20, getFairwayWidthStyle, undefined, 1, true, 314);
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
  const specialAreaSource = dvkMap.getVectorSource('specialarea');
  const boardLine12Source = dvkMap.getVectorSource('boardline12');
  const harborSource = dvkMap.getVectorSource('harbor');
  const circleSource = dvkMap.getVectorSource('circle');
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
        depthSource.getFeatureById(feature.getId() as number)?.unset('n2000HeightSystem');
        break;
      case 'area3456':
        area3456Source.addFeature(feature);
        break;
      case 'specialarea':
        specialAreaSource.addFeature(feature);
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
    }
  }
  selectedFairwayCardSource.getFeatures().forEach((f) => f.set('selected', false, true));
  selectedFairwayCardSource.clear();
  quaySource.clear();
}

function addQuayFeature(harbor: HarborPartsFragment, quay: Quay, features: VectorSource, format: GeoJSON) {
  const depth = quay.sections?.map((s) => s?.depth || 0).filter((v) => v !== undefined && v > 0);
  const feature = format.readFeature(quay.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
  feature.setId(quay.geometry?.coordinates?.join(';'));
  feature.setProperties({
    featureType: 'quay',
    harbor: harbor.id,
    quay: quay.name,
    extraInfo: quay.extraInfo,
    length: quay.length,
    depth,
    email: harbor.email,
    phoneNumber: harbor.phoneNumber,
    fax: harbor.fax,
    internet: harbor.internet,
  });
  features.addFeature(feature);
}

function addSectionFeature(harbor: HarborPartsFragment, quay: Quay, section: Section, features: VectorSource, format: GeoJSON) {
  const feature = format.readFeature(section.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
  feature.setId(section.geometry?.coordinates?.join(';'));
  feature.setProperties({
    featureType: 'quay',
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
  features.addFeature(feature);
}

function addQuay(harbor: HarborPartsFragment, features: VectorSource) {
  const format = new GeoJSON();
  for (const quay of harbor.quays || []) {
    if (quay && quay.geometry) {
      addQuayFeature(harbor, quay, features, format);
    } else {
      for (const section of quay?.sections || []) {
        if (quay && section && section.geometry) {
          addSectionFeature(harbor, quay, section, features, format);
        }
      }
    }
  }
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
    const specialAreaSource = dvkMap.getVectorSource('specialarea');
    const boardLine12Source = dvkMap.getVectorSource('boardline12');
    const harborSource = dvkMap.getVectorSource('harbor');
    const circleSource = dvkMap.getVectorSource('circle');
    unsetSelectedFairwayCard();

    const fairwayFeatures: Feature[] = [];
    for (const fairway of fairwayCard?.fairways || []) {
      for (const line of fairway.navigationLines || []) {
        let feature = line12Source.getFeatureById(line.id);
        if (feature) {
          line12Source.removeFeature(feature);
          fairwayFeatures.push(feature);
          feature.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
        } else {
          feature = line3456Source.getFeatureById(line.id);
          if (feature) {
            line3456Source.removeFeature(feature);
            fairwayFeatures.push(feature);
          }
        }
      }
      for (const area of fairway.areas || []) {
        let feature = area12Source.getFeatureById(area.id);
        if (feature) {
          area12Source.removeFeature(feature);
          fairwayFeatures.push(feature);
          feature.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
          feature = depthSource.getFeatureById(area.id);
          feature?.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
        } else {
          feature = area3456Source.getFeatureById(area.id);
          if (feature) {
            area3456Source.removeFeature(feature);
            fairwayFeatures.push(feature);
          }
        }
        if (!feature) {
          feature = specialAreaSource.getFeatureById(area.id);
          if (feature) {
            specialAreaSource.removeFeature(feature);
            fairwayFeatures.push(feature);
            feature.set('n2000HeightSystem', fairwayCard?.n2000HeightSystem || false);
          }
        }
      }
      for (const line of fairway.boardLines || []) {
        const feature = boardLine12Source.getFeatureById(line.id);
        if (feature) {
          boardLine12Source.removeFeature(feature);
          fairwayFeatures.push(feature);
        }
      }
      for (const circle of fairway.turningCircles || []) {
        const feature = circleSource.getFeatureById(circle.id);
        if (feature) {
          circleSource.removeFeature(feature);
          fairwayFeatures.push(feature);
        }
      }
    }

    for (const harbor of fairwayCard?.harbors || []) {
      const id = harbor.geometry?.coordinates?.join(';');
      const feature = id ? harborSource.getFeatureById(id) : undefined;
      if (feature) {
        harborSource.removeFeature(feature);
        fairwayFeatures.push(feature);
      }
      addQuay(harbor, quaySource);
    }
    fairwayFeatures.forEach((f) => f.set('selected', true, true));
    selectedFairwayCardSource.addFeatures(fairwayFeatures);

    const extent = olExtent.createEmpty();
    for (const feature of fairwayFeatures) {
      const geom = feature.getGeometry();
      if (geom) {
        olExtent.extend(extent, geom.getExtent());
      }
    }
    if (!olExtent.isEmpty(extent)) {
      dvkMap.olMap?.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
    }
  }
}

export function setSelectedPilotPlace(id?: number | string) {
  const dvkMap = getMap();
  const pilotSource = dvkMap.getVectorSource('pilot');

  for (const f of pilotSource.getFeatures()) {
    f.set('hoverStyle', id && f.getId() === id);
  }
  pilotSource.dispatchEvent('change');
}

export function setSelectedFairwayArea(id?: number | string) {
  const dvkMap = getMap();
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');

  for (const f of selectedFairwayCardSource.getFeatures()) {
    f.set('hoverStyle', id && ['area', 'specialarea'].includes(f.get('featureType')) && f.getId() === id);
  }
  selectedFairwayCardSource.dispatchEvent('change');
}

export function setSelectedHarbor(id?: string) {
  const dvkMap = getMap();
  const quaySource = dvkMap.getVectorSource('quay');

  for (const f of quaySource.getFeatures()) {
    f.set('hoverStyle', id && ['harbor'].includes(f.get('featureType')) && f.get('harborId') === id);
  }
  quaySource.dispatchEvent('change');
}

export function setSelectedQuay(quay: Maybe<Quay>) {
  const dvkMap = getMap();
  const quaySource = dvkMap.getVectorSource('quay');
  const ids = [];
  if (quay?.geometry?.coordinates) {
    ids.push(quay.geometry.coordinates.join(';'));
  } else if (quay?.sections) {
    quay.sections.forEach((s) => {
      if (s?.geometry?.coordinates) {
        ids.push(s.geometry.coordinates.join(';'));
      }
    });
  }
  for (const f of quaySource.getFeatures()) {
    if (f.get('featureType') === 'quay') {
      f.set('hoverStyle', ids.includes(f.getId() as string), true);
    } else {
      f.set('hoverStyle', false, true);
    }
  }
  quaySource.dispatchEvent('change');
}

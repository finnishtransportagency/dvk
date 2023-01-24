import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill, Icon } from 'ol/style';
import Map from 'ol/Map';
import pilotIcon from '../theme/img/pilotPlace.svg';
import pilotIconActive from '../theme/img/pilotPlace_active.svg';
import quayIcon from '../theme/img/dock_icon.svg';
import quayIconActive from '../theme/img/dock_icon_active.svg';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';
import Feature, { FeatureLike } from 'ol/Feature';
import { getMap } from './DvkMap';
import { FairwayCardPartsFragment, HarborPartsFragment, Quay, Section } from '../graphql/generated';
import { FeatureLayerId, Lang, MAP } from '../utils/constants';
import { HarborFeatureProperties, QuayFeatureProperties } from './features';
import * as olExtent from 'ol/extent';
import anchorage from '../theme/img/ankkurointialue.svg';
import meet from '../theme/img/kohtaamiskielto_ikoni.svg';
import specialarea from '../theme/img/erityisalue_tausta.svg';
import specialareaSelected from '../theme/img/erityisalue_tausta_active.svg';
import Polygon from 'ol/geom/Polygon';
import { getDepthStyle, getMarineWarningStyle, getSafetyEquipmentStyle, getNameStyle, getMareographStyle, getObservationStyle } from './styles';
import { getSpeedLimitStyle } from './layerStyles/speedLimitStyles';
import { GeoJSON } from 'ol/format';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

const specialAreaImage = new Image();
specialAreaImage.src = specialarea;
const specialAreaSelectedImage = new Image();
specialAreaSelectedImage.src = specialareaSelected;

export function getSpecialAreaStyle(feature: FeatureLike, color: string, width: number, selected: boolean) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const gradient = context.createPattern(selected ? specialAreaSelectedImage : specialAreaImage, 'repeat');
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

export function getAreaStyle(color: string, width: number, fillColor: string) {
  return new Style({
    stroke: new Stroke({
      color,
      width,
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
  });
}

export function getPilotStyle(selected: boolean) {
  const image = new Icon({
    src: selected ? pilotIconActive : pilotIcon,
    scale: selected ? 1.2 : 1,
    anchor: [0.5, 0.5],
  });
  return [
    new Style({
      image,
    }),
    new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
      }),
    }),
  ];
}

export function getQuayStyle(feature: FeatureLike, selected: boolean) {
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
    text = `${props.name} ${props.depth?.map((d) => dvkMap.t('popup.harbor.number', { val: d })).join(' m / ')} m`;
  } else if (props.depth) {
    text = `${props.depth?.map((d) => dvkMap.t('popup.harbor.number', { val: d })).join(' m / ')} m`;
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

export function getHarborStyle(feature: FeatureLike) {
  const image = new Icon({
    src: quayIcon,
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
  return [
    new Style({
      image,
      text: new Text({
        font: 'bold 18px "Exo2"',
        placement: 'line',
        offsetY: -55,
        text,
        fill: new Fill({
          color: '#000000',
        }),
        stroke: new Stroke({
          width: 3,
          color: '#ffffff',
        }),
      }),
    }),
    new Style({
      image: new CircleStyle({
        radius: 20,
        displacement: [0, 20],
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
      }),
    }),
  ];
}

function getSelectedFairwayCardStyle(feature: FeatureLike, resolution: number) {
  const ds = feature.getProperties().dataSource;
  if (ds === 'line12') {
    return getLineStyle('#0000FF', 2);
  } else if (ds === 'line3456') {
    return getLineStyle('#0000FF', 2);
  } else if (ds === 'area12' && resolution <= 100) {
    return getAreaStyle('#EC0E0E', 1, 'rgba(236,14,14,0.3)');
  } else if (ds === 'area3456' && resolution <= 100) {
    return getAreaStyle('#207A43', 1, 'rgba(32,122,67,0.3)');
  } else if (ds === 'specialarea') {
    return getSpecialAreaStyle(feature, '#C57A11', 2, true);
  } else if (ds === 'boardline12') {
    return getBoardLineStyle('#000000', 2);
  } else {
    return undefined;
  }
}

function addFeatureLayer(
  map: Map,
  id: FeatureLayerId,
  maxResolution: number | undefined,
  renderBuffer: number,
  style: StyleLike,
  minResolution: number | undefined = undefined,
  opacity = 1,
  className = 'bg-layer',
  declutter = false
) {
  map.addLayer(
    new VectorLayer({
      source: new VectorSource(),
      declutter,
      className,
      style,
      properties: { id },
      maxResolution,
      minResolution,
      renderBuffer,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
      opacity,
    })
  );
}

function addIceLayer(map: Map) {
  const apiKey = process.env.REACT_APP_FMI_MAP_API_KEY;
  const cloudFrontUrl = process.env.REACT_APP_FRONTEND_DOMAIN_NAME;
  const fmiMapApiUrl = process.env.REACT_APP_FMI_MAP_API_URL;
  let tileUrl;
  if (cloudFrontUrl) {
    // TODO: remove apikey from url once SOA api exists
    tileUrl = `https://${cloudFrontUrl}/fmi-apikey/${apiKey}/wms`;
  } else if (fmiMapApiUrl) {
    tileUrl = `https://${fmiMapApiUrl}/fmi-apikey/${apiKey}/wms`;
  } else {
    // TODO: remove apikey from url once SOA api exists
    tileUrl = `/fmi-apikey/${apiKey}/wms`;
  }
  map.addLayer(
    new TileLayer({
      properties: { id: 'ice' },
      source: new TileWMS({
        url: tileUrl,
        params: { layers: 'fmi:ice:icechart_iceareas' },
        transition: 0,
      }),
      preload: 10,
      opacity: 0.7,
    })
  );
}

export function addAPILayers(map: Map) {
  addIceLayer(map);
  // Kauppamerenkulku
  addFeatureLayer(map, 'area12', 75, 1, getAreaStyle('#EC0E0E', 1, 'rgba(236, 14, 14, 0.1)'));
  addFeatureLayer(map, 'line12', undefined, 1, getLineStyle('#0000FF', 1));
  addFeatureLayer(map, 'boardline12', undefined, 1, getBoardLineStyle('#000000', 1));
  // Muu vesiliikenne
  addFeatureLayer(map, 'area3456', 30, 1, getAreaStyle('#207A43', 1, 'rgba(32, 122, 67, 0.1)'));
  addFeatureLayer(map, 'line3456', 75, 1, getLineStyle('#0000FF', 1));

  addFeatureLayer(map, 'name', undefined, 1, getNameStyle, undefined, 1, 'bg-layer', true);
  // Ankkurointialue, Kohtaamis- ja ohittamiskieltoalue
  addFeatureLayer(map, 'specialarea', 30, 2, (feature) => getSpecialAreaStyle(feature, '#C57A11', 2, false));
  // Valitun väyläkortin navigointilinjat ja väyläalueet
  addFeatureLayer(map, 'selectedfairwaycard', undefined, 100, getSelectedFairwayCardStyle);
  // Nopeusrajoitus
  addFeatureLayer(map, 'speedlimit', 15, 2, (feature) => getSpeedLimitStyle(feature));
  // Haraussyvyydet
  addFeatureLayer(map, 'depth12', 10, 50, (feature) => getDepthStyle(feature));
  // Turvalaitteet
  addFeatureLayer(map, 'safetyequipment', 75, 50, (feature, resolution) =>
    getSafetyEquipmentStyle(feature.getProperties().symbol, feature.getProperties().faults !== undefined, resolution, false)
  );
  addFeatureLayer(map, 'marinewarning', undefined, 50, (feature) => getMarineWarningStyle(feature, false));

  addFeatureLayer(map, 'mareograph', undefined, 91, (feature) => getMareographStyle(feature), undefined, 1, 'ol-layer');
  addFeatureLayer(map, 'observation', undefined, 50, getObservationStyle);
  // POI:t
  // Luotsipaikat
  addFeatureLayer(map, 'pilot', undefined, 50, (feature) => getPilotStyle(feature.get('hoverStyle')));
  // Laiturit
  addFeatureLayer(map, 'quay', 3, 50, (feature) => getQuayStyle(feature, false), undefined, 1, 'ol-layer');
  // Satamat
  addFeatureLayer(map, 'harbor', 30, 1, (feature) => getHarborStyle(feature), 3, 1, 'ol-layer');
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
  const oldSelectedFeatures = selectedFairwayCardSource.getFeatures();
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
    }
  }
  selectedFairwayCardSource.clear();
  quaySource.clear();
}

function addQuayFeature(harbor: HarborPartsFragment, quay: Quay, features: VectorSource, format: GeoJSON) {
  const depth = quay.sections?.map((s) => s?.depth || 0).filter((v) => v !== undefined && v > 0);
  const feature = format.readFeature(quay.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
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
    }

    for (const harbor of fairwayCard?.harbors || []) {
      addQuay(harbor, quaySource);
    }

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
  const pilotFeatures = pilotSource.getFeatures();
  pilotSource.clear();

  const fairwayFeatures: Feature[] = [];
  for (const feature of pilotFeatures) {
    feature.set('hoverStyle', id && feature.getId() === id);
    fairwayFeatures.push(feature);
  }

  pilotSource.addFeatures(fairwayFeatures);
}

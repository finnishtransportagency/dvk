import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill } from 'ol/style';
import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';
import { getMap } from './DvkMap';
import { FairwayCardPartsFragment, HarborPartsFragment, Orientation, Quay, Section } from '../../graphql/generated';
import { FeatureDataLayerId, FeatureLayerId, MAP } from '../../utils/constants';
import * as olExtent from 'ol/extent';
import { getFairwayArea12Style } from './layerStyles/fairwayArea12Styles';
import { getFairwayArea3456Style } from './layerStyles/fairwayArea3456Styles';
import { getPilotStyle } from './layerStyles/pilotStyles';
import { getDepthStyle } from './layerStyles/depthStyles';
import { getSpeedLimitIconStyle, getSpeedLimitPolygonStyle } from './layerStyles/speedLimitStyles';
import { getNameStyle } from './layerStyles/nameStyles';
import { getSafetyEquipmentStyle } from './layerStyles/safetyEquipmentStyles';
import { GeoJSON } from 'ol/format';
import { getVtsStyle } from './layerStyles/vtsStyles';
import { getCircleStyle } from './layerStyles/circleStyles';
import { getFairwayAreaBorderFeatures } from '../../fairwayareaworker/FairwayAreaUtils';
import { Geometry } from 'ol/geom';
import { getPilotRouteStyle } from './layerStyles/pilotRouteStyles';
import { getPilotageLimitStyle } from './layerStyles/pilotageLimitStyles';
import { getNavigationLine12Style } from './layerStyles/navigationLine12Styles';
import { getNavigationLine3456Style } from './layerStyles/navigationLine3456Styles';
import { anchorageAreaIconStyle, getSpecialAreaPolygonStyle, getSpecialAreaStyle, meetAreaIconStyle } from './layerStyles/specialAreaStyles';
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
      return getNavigationLine3456Style(true);
    case 'area12':
      return resolution <= 100 ? getAreaStyleBySource('area12', highlighted) : undefined;
    case 'area12Borderline':
      return resolution <= 100 ? getArea12BorderLineStyle(feature) : undefined;
    case 'area3456':
      return resolution <= 100 ? getAreaStyleBySource('area3456', highlighted) : undefined;
    case 'specialarea2':
    case 'specialarea15':
      return getSpecialAreaStyle(feature, true, highlighted);
    case 'boardline12':
      return getBoardLineStyle(true);
    case 'safetyequipment':
      return getSafetyEquipmentStyle(feature, 1, false);
    case 'harbor':
      return getHarborStyle(feature, resolution, false, 3);
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
    style: getBoardLineStyle(false),
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
    style: getNavigationLine3456Style(false),
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
    renderBuffer: 50,
    style: getSelectedStyle,
    zIndex: 304,
  });
  // Satamat
  addFeatureVectorLayer({
    map: map,
    id: 'harbor',
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

function getFittingPadding() {
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
  const quaySource = dvkMap.getVectorSource('quay');
  const selectedFeatures = selectedFairwayCardSource.getFeatures().concat(quaySource.getFeatures());

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
    }
  }
  selectedFairwayCardSource.getFeatures().forEach((f) => f.set('selected', false, true));
  selectedFairwayCardSource.clear();
  quaySource.clear();
}

function addQuayFeature(harbor: HarborPartsFragment, quay: Quay, features: VectorSource, format: GeoJSON, showDepth: boolean) {
  const depth = quay.sections?.map((s) => s?.depth ?? 0).filter((v) => v !== undefined && v > 0);
  const feature = format.readFeature(quay.geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG }) as Feature<Geometry>;
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
  features.addFeature(feature);
}

function addSectionFeature(harbor: HarborPartsFragment, quay: Quay, section: Section, features: VectorSource, format: GeoJSON) {
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
  features.addFeature(feature);
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
      }
      for (const prohibitionArea of fairway.prohibitionAreas ?? []) {
        const feature = specialArea15Source.getFeatureById(prohibitionArea.id) as Feature<Geometry>;
        if (feature) {
          specialArea15Source.removeFeature(feature);
          fairwayFeatures.push(feature);
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

    fairwayFeatures.forEach((f) => f.set('selected', true, true));
    selectedFairwayCardSource.addFeatures(fairwayFeatures);

    const extent = olExtent.createEmpty();
    for (const feature of fairwayFeatures) {
      const geom = feature.getGeometry();
      if (geom) {
        olExtent.extend(extent, geom.getExtent());
      }
    }
    if (!olExtent.isEmpty(extent) && (dvkMap.currentExtent === null || !dvkMap.currentExtent.every((n, i) => n === extent[i]))) {
      dvkMap.olMap?.getView().fit(extent, { padding: getFittingPadding(), duration: 1000 });
      dvkMap.currentExtent = extent;
    }
  }
}

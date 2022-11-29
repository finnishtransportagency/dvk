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
import { useEffect } from 'react';
import { FindFairwayCardByIdQuery } from '../graphql/generated';
import { FeatureLayerId, Lang } from '../utils/constants';
import { HarborFeatureProperties, QuayFeatureProperties } from './features';
import * as olExtent from 'ol/extent';
import anchorage from '../theme/img/ankkurointialue.svg';
import meet from '../theme/img/kohtaamiskielto_ikoni.svg';
import specialarea from '../theme/img/erityisalue_tausta.svg';
import Polygon from 'ol/geom/Polygon';
import { getDepthStyle, getSafetyEquipmentStyle } from './styles';

const specialAreaImage = new Image();
specialAreaImage.src = specialarea;

function getSpecialAreaStyle(feature: FeatureLike, color: string, width: number) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const gradient = context.createPattern(specialAreaImage, 'repeat');
  return [
    ...getDepthStyle(feature),
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

function getAreaStyle(color: string, width: number, fillColor: string) {
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

function getLineStyle(color: string, width: number) {
  return new Style({
    stroke: new Stroke({
      color,
      width,
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
  opacity = 1
) {
  map.addLayer(
    new VectorLayer({
      source: new VectorSource(),
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

export function addAPILayers(map: Map) {
  // Kauppamerenkulku
  addFeatureLayer(map, 'line12', undefined, 1, getLineStyle('#0000FF', 1));
  addFeatureLayer(map, 'area12', 75, 1, getAreaStyle('#EC0E0E', 1, 'rgba(236, 14, 14, 0.1)'));
  // Muu vesiliikenne
  addFeatureLayer(map, 'line3456', 75, 1, getLineStyle('#0000FF', 1));
  addFeatureLayer(map, 'area3456', 30, 1, getAreaStyle('#207A43', 1, 'rgba(32, 122, 67, 0.1)'));

  // Nopeusrajoitus
  addFeatureLayer(map, 'restrictionarea', 15, 2, getLineStyle('purple', 2));
  // Ankkurointialue, Kohtaamis- ja ohittamiskieltoalue
  addFeatureLayer(map, 'specialarea', 30, 2, (feature) => getSpecialAreaStyle(feature, '#C57A11', 2));
  // Turvalaitteet
  addFeatureLayer(map, 'safetyequipment', 75, 50, (feature, resolution) => getSafetyEquipmentStyle(feature.getProperties().symbol, resolution));
  // Luotsipaikat
  addFeatureLayer(map, 'pilot', undefined, 50, (feature) => getPilotStyle(feature.get('hoverStyle')));
  // Valitun väyläkortin navigointilinjat ja väyläalueet
  addFeatureLayer(map, 'selectedfairwaycard', undefined, 100, getSelectedFairwayCardStyle);
  // Laiturit
  addFeatureLayer(map, 'quay', 3, 50, (feature) => getQuayStyle(feature, false));
  // Satamat
  addFeatureLayer(map, 'harbor', 30, 1, (feature) => getHarborStyle(feature), 3);
  // Syvyydet
  addFeatureLayer(map, 'depth12', 10, 50, (feature) => getDepthStyle(feature));
  addFeatureLayer(map, 'depth3456', 10, 50, (feature) => getDepthStyle(feature));
}

export function unsetSelectedFairwayCard() {
  const dvkMap = getMap();
  const line12Source = dvkMap.getVectorSource('line12');
  const line3456Source = dvkMap.getVectorSource('line3456');
  const area12Source = dvkMap.getVectorSource('area12');
  const area3456Source = dvkMap.getVectorSource('area3456');
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');

  const oldSelectedFeatures = selectedFairwayCardSource.getFeatures();
  for (const feature of oldSelectedFeatures) {
    switch (feature.getProperties().dataSource) {
      case 'line12':
        line12Source.addFeature(feature);
        break;
      case 'line3456':
        line3456Source.addFeature(feature);
        break;
      case 'area12':
        area12Source.addFeature(feature);
        break;
      case 'area3456':
        area3456Source.addFeature(feature);
        break;
    }
  }
  selectedFairwayCardSource.clear();
}

export function useSetSelectedFairwayCard(data: FindFairwayCardByIdQuery | undefined) {
  const dvkMap = getMap();
  useEffect(() => {
    if (data) {
      const line12Source = dvkMap.getVectorSource('line12');
      const line3456Source = dvkMap.getVectorSource('line3456');
      const area12Source = dvkMap.getVectorSource('area12');
      const area3456Source = dvkMap.getVectorSource('area3456');
      const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');

      unsetSelectedFairwayCard();

      const fairwayFeatures: Feature[] = [];

      for (const fairway of data?.fairwayCard?.fairways || []) {
        for (const line of fairway.navigationLines || []) {
          let feature = line12Source.getFeatureById(line.id);
          if (feature) {
            feature.setProperties({ dataSource: 'line12' });
            line12Source.removeFeature(feature);
            fairwayFeatures.push(feature);
          } else {
            feature = line3456Source.getFeatureById(line.id);
            if (feature) {
              feature.setProperties({ dataSource: 'line2345' });
              line3456Source.removeFeature(feature);
              fairwayFeatures.push(feature);
            }
          }
        }
        for (const area of fairway.areas || []) {
          let feature = area12Source.getFeatureById(area.id);
          if (feature) {
            feature.setProperties({ dataSource: 'area12' });
            area12Source.removeFeature(feature);
            fairwayFeatures.push(feature);
          } else {
            feature = area3456Source.getFeatureById(area.id);
            if (feature) {
              feature.setProperties({ dataSource: 'area3456' });
              area3456Source.removeFeature(feature);
              fairwayFeatures.push(feature);
            }
          }
        }
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
  }, [data, dvkMap]);
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

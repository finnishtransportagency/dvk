import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill, Icon } from 'ol/style';
import Map from 'ol/Map';
import pilot_logo from '../theme/img/pilotPlace.svg';
import quayIcon from '../theme/img/dock_icon.svg';
import quayIconActive from '../theme/img/dock_icon_active.svg';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';
import Feature, { FeatureLike } from 'ol/Feature';
import { getMap } from './DvkMap';
import { useEffect, useState } from 'react';
import Geometry from 'ol/geom/Geometry';
import { FindFairwayCardByIdQuery } from '../graphql/generated';
import { FeatureLayerIdType, Lang } from '../utils/constants';
import { HarborFeatureProperties, QuayFeatureProperties } from './features';
import * as olExtent from 'ol/extent';
import anchorage from '../theme/img/ankkurointialue.svg';
import meet from '../theme/img/kohtaamiskielto_ikoni.svg';
import specialarea from '../theme/img/erityisalue_tausta.svg';
import Polygon from 'ol/geom/Polygon';
import { getDepthStyle, getSafetyEquipmentStyle } from './styles';

const specialAreaImage = new Image();
specialAreaImage.src = specialarea;

function getSpecialAreaStyle(color: string, width: number, type: number) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const gradient = context.createPattern(specialAreaImage, 'repeat');
  return [
    new Style({
      image: new Icon({
        src: type === 2 ? anchorage : meet,
        opacity: 1,
      }),
      zIndex: 100,
      geometry: function (feature) {
        const geometry = feature.getGeometry() as Polygon;
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

export function getPilotStyle() {
  const image = new Icon({
    src: pilot_logo,
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
  if (props.name && props.draft) {
    text = `${props.name} ${props.draft?.map((d) => dvkMap.t('popup.harbor.number', { val: d })).join(' m / ')} m`;
  } else if (props.draft) {
    text = `${props.draft?.map((d) => dvkMap.t('popup.harbor.number', { val: d })).join(' m / ')} m`;
  } else if (props.name) {
    text = props.name;
  } else {
    text = '';
  }
  return [
    new Style({
      image: selected ? activeImage : image,
      text: new Text({
        font: 'bold 18px "Exo 2"',
        placement: 'line',
        offsetY: -50,
        text,
        fill: new Fill({
          color: selected ? '#0064AF' : '#000000',
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
        font: 'bold 18px "Exo 2"',
        placement: 'line',
        offsetY: -50,
        text,
        fill: new Fill({
          color: '#000000',
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

function addFeatureLayer(
  map: Map,
  id: FeatureLayerIdType,
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
  addFeatureLayer(map, 'line12', 500, 1, getLineStyle('#0000FF', 1));
  addFeatureLayer(map, 'area12', 100, 1, getAreaStyle('#EC0E0E', 1, 'rgba(236, 14, 14, 0.1)'));
  // Muu vesiliikenne
  addFeatureLayer(map, 'line3456', 50, 1, getLineStyle('#0000FF', 1));
  addFeatureLayer(map, 'area3456', 30, 1, getAreaStyle('#207A43', 1, 'rgba(32, 122, 67, 0.1)'));

  // Nopeusrajoitus
  addFeatureLayer(map, 'restrictionarea', 10, 2, getLineStyle('purple', 2));
  // Ankkurointialue, Kohtaamis- ja ohittamiskieltoalue
  addFeatureLayer(map, 'specialarea', 30, 2, (feature) => getSpecialAreaStyle('#C57A11', 2, feature.getProperties().typeCode));
  // Turvalaitteet
  addFeatureLayer(map, 'safetyequipment', 10, 50, (feature) => getSafetyEquipmentStyle(feature.getProperties().symbol));
  // Luotsipaikat
  addFeatureLayer(map, 'pilot', undefined, 50, getPilotStyle());
  // Laiturit
  addFeatureLayer(map, 'quay', 3, 50, (feature) => getQuayStyle(feature, false));
  // Satamat
  addFeatureLayer(map, 'harbor', 20, 1, (feature) => getHarborStyle(feature), 3);
  // Syvyydet
  addFeatureLayer(map, 'depth', 20, 50, (feature) => getDepthStyle(feature));
}

function setFeatureStyle(
  source: VectorSource<Geometry>,
  source2: VectorSource<Geometry>,
  id: number,
  style: Style,
  style2: Style,
  selected: FeatureAndStyle[]
) {
  let feature = source.getFeatureById(id);
  if (feature) {
    selected.push({ feature, style: feature.getStyle() });
    feature.setStyle(style);
  } else {
    feature = source2.getFeatureById(id);
    if (feature) {
      selected.push({ feature, style: feature.getStyle() });
      feature.setStyle(style2);
    }
  }
}

type FeatureAndStyle = {
  feature: Feature<Geometry>;
  style: StyleLike | undefined;
};

export function useHighlightFairway(data: FindFairwayCardByIdQuery | undefined) {
  const dvkMap = getMap();
  const [features, setFeatures] = useState<FeatureAndStyle[]>([]);
  useEffect(() => {
    return () => {
      for (const f of features) {
        f.feature.setStyle(f.style);
      }
    };
  }, [features]);
  useEffect(() => {
    if (data) {
      const source = dvkMap.getVectorSource('line12');
      const source2 = dvkMap.getVectorSource('line3456');
      const source3 = dvkMap.getVectorSource('area12');
      const source4 = dvkMap.getVectorSource('area3456');
      const style = getLineStyle('#0000FF', 2);
      const style2 = getAreaStyle('#EC0E0E', 1, 'rgba(236,14,14,0.3)');
      const style3 = getAreaStyle('#207A43', 1, 'rgba(32,122,67,0.3)');
      const selected: FeatureAndStyle[] = [];
      for (const fairway of data?.fairwayCard?.fairways || []) {
        for (const line of fairway.navigationLines || []) {
          setFeatureStyle(source, source2, line.id, style, style, selected);
        }
        for (const area of fairway.areas || []) {
          setFeatureStyle(source3, source4, area.id, style2, style3, selected);
        }
      }
      console.log('selected: ' + selected.length);
      setFeatures(selected);
    }
  }, [setFeatures, data, dvkMap]);
}

export function useCenterToFairway(data: FindFairwayCardByIdQuery | undefined) {
  const dvkMap = getMap();
  useEffect(() => {
    if (data) {
      const line12Source = dvkMap.getVectorSource('line12');
      const line3456Source = dvkMap.getVectorSource('line3456');
      const area12Source = dvkMap.getVectorSource('area12');
      const area3456Source = dvkMap.getVectorSource('area3456');

      const fairwayFeatures: Feature[] = [];

      for (const fairway of data?.fairwayCard?.fairways || []) {
        for (const line of fairway.navigationLines || []) {
          let feature = line12Source.getFeatureById(line.id);
          if (!feature) {
            feature = line3456Source.getFeatureById(line.id);
          }
          if (feature) {
            fairwayFeatures.push(feature);
          }
        }
        for (const area of fairway.areas || []) {
          let feature = area12Source.getFeatureById(area.id);
          if (!feature) {
            feature = area3456Source.getFeatureById(area.id);
          }
          if (feature) {
            fairwayFeatures.push(feature);
          }
        }
      }

      if (fairwayFeatures.length > 0) {
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
  }, [data, dvkMap]);
}

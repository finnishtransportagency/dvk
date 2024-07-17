import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { getMap } from '../DvkMap';
import depthIconMWsmall from '../../theme/img/depthmw1.svg';
import depthIconMWbig from '../../theme/img/depthmw2.svg';
import { AreaFeatureProperties, LineFeatureProperties } from '../features';
import { Polygon } from 'ol/geom';

export function isShowN2000HeightSystem(props: AreaFeatureProperties | LineFeatureProperties): boolean {
  if (props.n2000HeightSystem !== undefined) {
    return props.n2000HeightSystem;
  } else {
    return (props.referenceLevel && props.referenceLevel.indexOf('N2000') !== -1) || !!props.n2000depth || !!props.n2000draft;
  }
}

export function getDepthStyle(feature: FeatureLike) {
  const props = feature.getProperties() as AreaFeatureProperties;
  const dvkMap = getMap();
  const n2000HeightSystem = isShowN2000HeightSystem(feature.getProperties() as AreaFeatureProperties);
  const text =
    dvkMap.t('popup.quay.number', { val: n2000HeightSystem ? (props.n2000depth ?? props.depth) : props.depth }) + (n2000HeightSystem ? 'm' : '');

  const specialFeature = feature.getProperties().areaType === 2;
  let image;
  if (!n2000HeightSystem) {
    image = new Icon({
      src: props.depth || 0 > 10 ? depthIconMWbig : depthIconMWsmall,
      anchor: [0.5, specialFeature ? -15 : 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: specialFeature ? 'pixels' : 'fraction',
      opacity: 1,
    });
  }
  return [
    new Style({
      zIndex: 100,
      image,
      geometry: function (feat) {
        const geometry = feat.getGeometry() as Polygon;
        return geometry.getInteriorPoint();
      },
      text: new Text({
        font: 'bold 12px "Exo2"',
        placement: 'line',
        offsetY: specialFeature ? 28 : 1,
        text,
        fill: new Fill({
          color: '#FF00FF',
        }),
        stroke: new Stroke({
          width: 1,
          color: '#FFFFFF',
        }),
      }),
    }),
  ];
}

const soundingPointStyle = new Style({
  text: new Text({
    font: 'bold 12px "Exo2"',
    placement: 'point',
    text: '',
    fill: new Fill({
      color: '#000000',
    }),
    stroke: new Stroke({
      width: 1,
      color: '#FFFFFF',
    }),
  }),
});

export function getSoundingPointStyle(feature: FeatureLike) {
  soundingPointStyle.getText()?.setText(String(feature.getProperties().DEPTH));
  return soundingPointStyle;
}

const depthContourStyle1 = new Style({
  stroke: new Stroke({
    color: '#3B6683',
    width: 1,
    lineDash: [2, 2],
  }),
});
const depthContourStyle2 = new Style({
  stroke: new Stroke({
    color: '#3B6683',
    width: 1,
    lineDash: [5, 5],
  }),
});
const depthContourStyle3 = new Style({
  stroke: new Stroke({
    color: '#3B6683',
    width: 1,
  }),
});

export function getDepthContourStyle(feature: FeatureLike) {
  const level = feature.getProperties().VALDCO as number;
  if (level === 3) {
    return depthContourStyle1;
  } else if (level === 6) {
    return depthContourStyle2;
  } else {
    return depthContourStyle3;
  }
}

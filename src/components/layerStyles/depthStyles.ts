import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { getMap } from '../DvkMap';
import depthIconMWsmall from '../../theme/img/depthmw1.svg';
import depthIconMWbig from '../../theme/img/depthmw2.svg';
import { AreaFeatureProperties, LineFeatureProperties } from '../features';
import { Polygon } from 'ol/geom';

export function isShowN2000HeightSystem(props: AreaFeatureProperties | LineFeatureProperties): boolean | undefined {
  const n2000HeightSystem = props.n2000HeightSystem;
  if (n2000HeightSystem !== undefined) {
    if (n2000HeightSystem && props.n2000depth) {
      return true;
    } else if (!n2000HeightSystem && props.depth) {
      return false;
    } else {
      return undefined;
    }
  } else {
    if (props.n2000depth) {
      return true;
    } else if (props.depth) {
      return false;
    } else {
      return undefined;
    }
  }
}

export function getDepthStyle(feature: FeatureLike) {
  const props = feature.getProperties() as AreaFeatureProperties;
  let text;
  const dvkMap = getMap();
  const n2000HeightSystem = isShowN2000HeightSystem(feature.getProperties() as AreaFeatureProperties);
  if (n2000HeightSystem === true) {
    text = dvkMap.t('popup.harbor.number', { val: props.n2000depth }) + 'm';
  } else if (n2000HeightSystem === false) {
    text = dvkMap.t('popup.harbor.number', { val: props.depth });
  } else {
    text = '-';
  }

  const specialFeature = feature.getProperties().areaType === 2 || feature.getProperties().areaType === 15;
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

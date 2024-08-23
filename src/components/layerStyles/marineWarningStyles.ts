import Feature, { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke, Text } from 'ol/style';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import marinearea from '../../theme/img/merivaroitus_tausta.svg';
import marineareaSelected from '../../theme/img/merivaroitus_tausta_valittu.svg';
import { isGeneralMarineWarning, getWarningImgSource } from '../../utils/common';
import { MarineWarningFeatureProperties } from '../features';
import CircleStyle from 'ol/style/Circle';

const marineAreaImage = new Image();
marineAreaImage.src = marinearea;
let areaStyle: Style | undefined = undefined;

const marineAreaSelectedImage = new Image();
marineAreaSelectedImage.src = marineareaSelected;
let selectedAreaStyle: Style | undefined = undefined;

function getAreaStyle(selected: boolean) {
  let s = selected ? selectedAreaStyle : areaStyle;
  if (!s) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const gradient = context.createPattern(selected ? marineAreaSelectedImage : marineAreaImage, 'repeat');
    s = new Style({
      stroke: new Stroke({
        color: '#EC0E0E',
        width: 2,
      }),
      fill: new Fill({
        color: gradient,
      }),
      zIndex: 1,
    });
    if (selected) {
      selectedAreaStyle = s;
    } else {
      areaStyle = s;
    }
  }
  return s;
}

function getLineStyle(feature: FeatureLike) {
  return new Style({
    stroke: new Stroke({
      color: '#EC0E0E',
      width: 2,
    }),
    geometry: () => {
      return feature.getGeometry();
    },
    zIndex: 1,
  });
}

function getIconStyle(feature: FeatureLike, selected: boolean) {
  const selectedScale = selected ? 1.2 : 1;
  const featureProperties = feature.getProperties() as MarineWarningFeatureProperties;
  const iconScale = isGeneralMarineWarning(featureProperties.area) ? 1.5 * selectedScale : 1 * selectedScale;

  const featureGeometry = feature.getGeometry() as Geometry;
  let iconGeometry: Point | undefined = undefined;
  if (featureGeometry?.getType() === 'Point') {
    iconGeometry = featureGeometry as Point;
  } else if (featureGeometry?.getType() === 'LineString') {
    iconGeometry = new Point((featureGeometry as LineString).getFlatMidpoint());
  } else if (featureGeometry?.getType() === 'Polygon') {
    iconGeometry = (featureGeometry as Polygon).getInteriorPoint();
  }

  return new Style({
    image: new Icon({
      src: getWarningImgSource(featureProperties.type?.fi ?? ''),
      opacity: 1,
      anchor: [0.5, 28],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      scale: iconScale,
    }),
    geometry: iconGeometry,
    zIndex: 2,
  });
}

function getClusterCountStyle(count: number) {
  return new Style({
    image: new CircleStyle({
      radius: 10,
      stroke: new Stroke({
        color: '#000',
      }),
      fill: new Fill({
        color: '#fff',
      }),
      displacement: [10, 0],
    }),
    text: new Text({
      text: count.toString(),
      fill: new Fill({
        color: '#000',
      }),
      offsetX: 10,
      offsetY: 0,
    }),
    zIndex: 3,
  });
}

export function getMarineWarningStyle(feature: FeatureLike, selected: boolean) {
  const styles: Style[] = [];
  let feat = feature;
  if (feature.get('cluster')) {
    const feats = feature.get('features');
    if (feats.length < 1) {
      return undefined;
    } else if (feats.length === 1) {
      feat = feature.get('features')[0];
    } else {
      feat = new Feature();
      feat.setProperties((feature.get('features')[0] as Feature).getProperties());
      feat.setGeometry((feature as Feature).getGeometry());
      styles.push(getClusterCountStyle(feats.length));
    }
  }

  styles.push(getIconStyle(feat, selected));

  if (feat.getGeometry()?.getType() === 'Polygon') {
    styles.push(getAreaStyle(selected));
  } else if (feat.getGeometry()?.getType() === 'LineString') {
    styles.push(getLineStyle(feat));
  }
  return styles;
}

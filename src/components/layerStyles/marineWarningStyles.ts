import Feature, { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke, Text } from 'ol/style';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import { isGeneralMarineWarning, getWarningImgSource } from '../../utils/common';
import { MarineWarningFeatureProperties } from '../features';
import CircleStyle from 'ol/style/Circle';
import { getStripeFill } from './utils/stripeFill';

let areaStyle: Style | undefined = undefined;
let selectedAreaStyle: Style | undefined = undefined;

function getAreaStyle(feature: FeatureLike) {
  const selected = feature.get('hoverStyle');
  let s = selected ? selectedAreaStyle : areaStyle;
  if (!s) {
    let stripeFill;
    if (selected) {
      stripeFill = getStripeFill('rgba(236, 14, 14, 0.65)', 'rgba(236, 14, 14, 0.4)');
    } else {
      stripeFill = getStripeFill('rgba(236, 14, 14, 0.5)', 'rgba(236, 14, 14, 0.25)');
    }
    s = new Style({
      stroke: new Stroke({
        color: '#EC0E0E',
        width: 2,
      }),
      fill: stripeFill,
      zIndex: 1,
    });
    if (selected) {
      selectedAreaStyle = s;
    } else {
      areaStyle = s;
    }
  }

  s.setGeometry(() => {
    return feature.getGeometry();
  });

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

function getIconStyle(feature: FeatureLike) {
  const selected = feature.get('hoverStyle');
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

function getClusterCountStyle(count: number, selected: boolean) {
  return new Style({
    image: new CircleStyle({
      radius: selected ? 1.2 * 10 : 10,
      fill: new Fill({
        color: '#00509b',
      }),
      displacement: selected ? [1.2 * 12, 1.2 * 28] : [12, 28],
    }),
    text: new Text({
      text: count.toString(),
      font: selected ? `bold 14px "Exo2"` : `bold 12px "Exo2"`,
      fill: new Fill({
        color: '#fff',
      }),
      offsetX: selected ? 1.2 * 12 : 12,
      offsetY: selected ? 1.2 * -28 : -28,
    }),
    zIndex: 3,
  });
}

function getClusterStyles(feature: FeatureLike) {
  const feats = feature.get('features') as Array<Feature>;
  const styles: Style[] = [];
  if (feats.length >= 1) {
    const clusterSelected = feature.get('hoverStyle');

    for (const f of feats) {
      const feat = new Feature();
      feat.setProperties(f.getProperties());
      feat.set('hoverStyle', feat.get('hoverStyle') || clusterSelected);
      feat.setGeometry(f.getGeometry());
      if (feat.getGeometry()?.getType() === 'Polygon') {
        styles.push(getAreaStyle(feat));
      } else if (feat.getGeometry()?.getType() === 'LineString') {
        styles.push(getLineStyle(feat));
      }
    }
    const feat = new Feature();
    feat.setProperties((feature.get('features')[0] as Feature).getProperties());
    feat.set('hoverStyle', feats.some((f) => f.get('hoverStyle')) || clusterSelected);
    feat.setGeometry((feature as Feature).getGeometry());
    styles.push(getIconStyle(feat));

    if (feats.length > 1) {
      styles.push(getClusterCountStyle(feats.length, feat.get('hoverStyle')));
    }
  }
  return styles;
}

export function getMarineWarningStyle(feature: FeatureLike) {
  if (feature.get('cluster')) {
    return getClusterStyles(feature);
  }
  const styles: Style[] = [];
  if (feature.getGeometry()?.getType() === 'Polygon') {
    styles.push(getAreaStyle(feature));
  } else if (feature.getGeometry()?.getType() === 'LineString') {
    styles.push(getLineStyle(feature));
  }
  styles.push(getIconStyle(feature));
  return styles;
}

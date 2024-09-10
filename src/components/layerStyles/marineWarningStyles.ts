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

function getAreaStyle(feature: FeatureLike, selected: boolean) {
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

export function getMarineWarningStyle(feature: FeatureLike, selected: boolean) {
  const styles: Style[] = [];
  let selectedIcon = selected;
  let feat = feature;
  if (feature.get('cluster')) {
    const feats = feature.get('features') as Array<Feature>;
    if (feats.length < 1) {
      return undefined;
    } else if (feats.length === 1) {
      feat = feature.get('features')[0];
      if (feat.get('hoverStyle') === true) {
        selectedIcon = true;
      }
    } else {
      for (const f of feats) {
        feat = new Feature();
        feat.setProperties(f.getProperties());
        feat.setGeometry(f.getGeometry());
        if (feat.getGeometry()?.getType() === 'Polygon') {
          styles.push(getAreaStyle(feat, selected));
        } else if (feat.getGeometry()?.getType() === 'LineString') {
          styles.push(getLineStyle(feat));
        }
        if (feat.get('hoverStyle') === true) {
          selectedIcon = true;
        }
      }
      feat = new Feature();
      feat.setProperties((feature.get('features')[0] as Feature).getProperties());
      feat.setGeometry((feature as Feature).getGeometry());
      styles.push(getClusterCountStyle(feats.length, selectedIcon));
    }
  } else if (feature.get('hoverStyle') === true) {
    selectedIcon = true;
  }

  styles.push(getIconStyle(feat, selectedIcon));

  if (feat.getGeometry()?.getType() === 'Polygon') {
    styles.push(getAreaStyle(feat, selected));
  } else if (feat.getGeometry()?.getType() === 'LineString') {
    styles.push(getLineStyle(feat));
  }
  return styles;
}

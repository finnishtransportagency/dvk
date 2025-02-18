import { FeatureLike } from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { Icon, Stroke, Style } from 'ol/style';
import { getStripeFill } from './utils/stripeFill';
import anchorage from '../../../theme/img/ankkurointialue.svg';
import meet from '../../../theme/img/kohtaamiskielto_ikoni.svg';

export function getSpecialAreaPolygonStyle(feature: FeatureLike, selected: boolean, selected2 = false) {
  let stripeFill;
  if (selected2) {
    stripeFill = getStripeFill('rgba(255, 195, 0, 0.65)', 'rgba(255, 195, 0, 0.4)');
  } else {
    stripeFill = getStripeFill('rgba(255, 195, 0, 0.5)', 'rgba(255, 195, 0, 0.25)');
  }

  return new Style({
    stroke: new Stroke({
      color: '#C57A11',
      width: 2,
    }),
    fill: stripeFill,
    zIndex: 2,
  });
}

export function getSpecialArea9Style(feature: FeatureLike, resolution: number) {
  const selectedCard = !!feature.get('selected');
  let stripeFill;
  if (selectedCard) {
    stripeFill = getStripeFill('rgba(236, 14, 14, 0.65)', 'rgba(236, 14, 14, 0.4)');
  } else {
    stripeFill = getStripeFill('rgba(236, 14, 14, 0.5)', 'rgba(236, 14, 14, 0.25)');
  }
  const styles: Array<Style> = [];

  if (!selectedCard || resolution <= 100) {
    styles.push(new Style({ fill: stripeFill }));
  }

  if (selectedCard && resolution <= 100) {
    const borderStyle = new Style({
      stroke: new Stroke({
        color: '#ec0e0e',
        width: 1,
      }),
    });
    styles.push(borderStyle);
  } else if (resolution <= 30) {
    const borderStyle = new Style({
      stroke: new Stroke({
        color: '#ec0e0e',
        width: resolution > 15 ? 0.5 : 1,
      }),
    });
    styles.push(borderStyle);
  }

  return styles;
}

export const anchorageAreaIconStyle = new Style({
  image: new Icon({
    src: anchorage,
    opacity: 1,
  }),
  geometry: function (feat) {
    const geometry = feat.getGeometry() as Polygon;
    return geometry.getInteriorPoint();
  },
});

export const meetAreaIconStyle = new Style({
  image: new Icon({
    src: meet,
    opacity: 1,
  }),
  geometry: function (feat) {
    const geometry = feat.getGeometry() as Polygon;
    return geometry.getInteriorPoint();
  },
});

export function getSpecialAreaStyle(feature: FeatureLike, selected: boolean, selected2 = false) {
  const polygonStyle = getSpecialAreaPolygonStyle(feature, selected, selected2);
  const iconStyle = feature.getProperties().typeCode === 2 ? anchorageAreaIconStyle : meetAreaIconStyle;
  iconStyle.setZIndex(1000);
  return [polygonStyle, iconStyle];
}

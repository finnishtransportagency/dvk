import { FeatureLike } from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import anchorage from '../../../theme/img/ankkurointialue.svg';
import meet from '../../../theme/img/kohtaamiskielto_ikoni.svg';
import specialarea from '../../../theme/img/erityisalue_tausta.svg';
import specialareaSelected from '../../../theme/img/erityisalue_tausta_active.svg';
import specialareaSelected2 from '../../../theme/img/erityisalue_tausta_active2.svg';

const specialAreaImage = new Image();
specialAreaImage.src = specialarea;
const specialAreaSelectedImage = new Image();
specialAreaSelectedImage.src = specialareaSelected;
const specialAreaSelectedImage2 = new Image();
specialAreaSelectedImage2.src = specialareaSelected2;

export function getSpecialAreaPolygonStyle(feature: FeatureLike, selected: boolean, selected2 = false) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  let gradient;
  if (selected2) {
    gradient = context.createPattern(specialAreaSelectedImage2, 'repeat');
  } else {
    gradient = context.createPattern(selected ? specialAreaSelectedImage : specialAreaImage, 'repeat');
  }
  return new Style({
    stroke: new Stroke({
      color: '#C57A11',
      width: 2,
    }),
    fill: new Fill({
      color: gradient,
    }),
    zIndex: 2,
  });
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

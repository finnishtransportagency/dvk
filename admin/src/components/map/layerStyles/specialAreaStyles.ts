import { FeatureLike } from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import anchorage from '../../../theme/img/ankkurointialue.svg';
import meet from '../../../theme/img/kohtaamiskielto_ikoni.svg';
import specialarea from '../../../theme/img/erityisalue_tausta.svg';
import specialareaSelected from '../../../theme/img/erityisalue_tausta_active.svg';
import specialareaSelected2 from '../../../theme/img/erityisalue_tausta_active2.svg';
import specialarea9 from '../../../theme/img/erikoisalue_tausta.svg';
import specialarea9Selected from '../../../theme/img/erikoisalue_tausta_active.svg';
import specialarea9Selected2 from '../../../theme/img/erikoisalue_tausta_active2.svg';

const specialAreaImage = new Image();
specialAreaImage.src = specialarea;
const specialAreaSelectedImage = new Image();
specialAreaSelectedImage.src = specialareaSelected;
const specialAreaSelectedImage2 = new Image();
specialAreaSelectedImage2.src = specialareaSelected2;

const specialArea9Image = new Image();
specialArea9Image.src = specialarea9;
const specialArea9SelectedImage = new Image();
specialArea9SelectedImage.src = specialarea9Selected;
const specialArea9SelectedImage2 = new Image();
specialArea9SelectedImage2.src = specialarea9Selected2;

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

export function getSpecialArea9Style(feature: FeatureLike) {
  const highlighted = !!feature.get('hoverStyle');
  const selectedCard = !!feature.get('selected');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  let gradient;
  if (selectedCard && highlighted) {
    gradient = context.createPattern(specialArea9SelectedImage2, 'repeat');
  } else if (selectedCard || highlighted) {
    gradient = context.createPattern(specialArea9SelectedImage, 'repeat');
  } else {
    gradient = context.createPattern(specialArea9Image, 'repeat');
  }
  return new Style({
    stroke: new Stroke({
      color: '#ec0e0e',
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

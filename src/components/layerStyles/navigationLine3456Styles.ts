import { FeatureLike } from 'ol/Feature';
import { Style, Stroke } from 'ol/style';

const lineStyle = new Style({
  stroke: new Stroke({
    color: '#0000FF',
    width: 1,
  }),
});

const selectedLineStyle = new Style({
  stroke: new Stroke({
    color: '#0000FF',
    width: 2,
  }),
});

export function getNavigationLine3456Style(feature: FeatureLike) {
  const selectedCard = !!feature.get('selected');
  const hovered = !!feature.get('hoverStyle');
  return selectedCard || hovered ? selectedLineStyle : lineStyle;
}

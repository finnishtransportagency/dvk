import { FeatureLike } from 'ol/Feature';
import { Style, Stroke } from 'ol/style';

const boardLineStyle = new Style({
  stroke: new Stroke({
    color: '#000000',
    width: 0.5,
    lineDash: [15, 10],
  }),
});

const selectedBoardLineStyle = new Style({
  stroke: new Stroke({
    color: '#000000',
    width: 1,
    lineDash: [15, 10],
  }),
  zIndex: 202,
});

export function getBoardLineStyle(feature: FeatureLike) {
  const selectedCard = !!feature.get('selected');
  return selectedCard ? selectedBoardLineStyle : boardLineStyle;
}

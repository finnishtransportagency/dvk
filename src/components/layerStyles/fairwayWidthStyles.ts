import { FeatureLike } from 'ol/Feature';
import { Style, Stroke, Fill, Text } from 'ol/style';

let lineStyle: Style | undefined = undefined;

export function getFairwayWidthStyle(feature: FeatureLike) {
  const width = feature.getProperties().width;
  if (!lineStyle) {
    lineStyle = new Style({
      stroke: new Stroke({
        color: '#000000',
        width: 1,
        lineDash: [10, 5],
      }),
      text: new Text({
        font: '12px "Exo2"',
        placement: 'line',
        textAlign: 'center',
        textBaseline: 'bottom',
        offsetY: -3,
        text: Math.round(width) + 'm',
        fill: new Fill({
          color: '#000000',
        }),
        stroke: new Stroke({
          width: 5,
          color: '#ffffff',
        }),
      }),
    });
  } else {
    lineStyle.getText().setText(Math.floor(width) + 'm');
  }
  return lineStyle;
}

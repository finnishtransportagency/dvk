import { FeatureLike } from 'ol/Feature';
import { LineString, Point } from 'ol/geom';
import { Style, Stroke, Fill, Text, Icon } from 'ol/style';
import arrowIcon from '../../theme/img/arrow-right.svg';

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
    lineStyle.getText().setText(' ' + Math.floor(width) + 'm');
  }

  const styles = [lineStyle];

  const geometry = feature.getGeometry() as LineString;
  const start = geometry.getFirstCoordinate();
  const end = geometry.getLastCoordinate();
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const rotation = Math.atan2(dy, dx);
  const startStyle = new Style({
    geometry: new Point(start),
    image: new Icon({
      src: arrowIcon,
      anchor: [1, 0.5],
      rotateWithView: true,
      rotation: -rotation - Math.PI,
    }),
  });
  styles.push(startStyle);
  const endStyle = new Style({
    geometry: new Point(end),
    image: new Icon({
      src: arrowIcon,
      anchor: [1, 0.5],
      rotateWithView: true,
      rotation: -rotation,
    }),
  });
  styles.push(endStyle);

  return styles;
}

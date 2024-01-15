import { LineString, Point } from 'ol/geom';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import arrowIcon from '../../../theme/img/arrow-right.svg';

const lineStyle = new Style({
  stroke: new Stroke({
    color: '#000000',
    width: 1,
    lineDash: [10, 5],
  }),
  text: new Text({
    font: '12px "Exo2"',
    placement: 'line',
    textBaseline: 'bottom',
    textAlign: 'center',
    offsetY: -8,
    text: '',
    overflow: true,
    fill: new Fill({
      color: '#000000',
    }),
    stroke: new Stroke({
      width: 3,
      color: '#FFFFFF',
    }),
    rotateWithView: true,
  }),
});

const lineHeadIcon = new Icon({
  src: arrowIcon,
  anchor: [1, 0.5],
  rotateWithView: true,
});

const startStyle = new Style({
  image: lineHeadIcon,
});

const endStyle = new Style({
  image: lineHeadIcon.clone(),
});

export function getMeasureLineStyles(lineString: LineString, text: string): Array<Style> {
  lineStyle.setGeometry(lineString);
  lineStyle.getText()?.setText(text);

  const start = lineString.getFirstCoordinate();
  const end = lineString.getLastCoordinate();
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const rotation = Math.atan2(dy, dx);

  startStyle.setGeometry(new Point(start));
  startStyle.getImage()?.setRotation(Math.PI - rotation);

  endStyle.setGeometry(new Point(end));
  endStyle.getImage()?.setRotation(-rotation);

  return [lineStyle, startStyle, endStyle];
}

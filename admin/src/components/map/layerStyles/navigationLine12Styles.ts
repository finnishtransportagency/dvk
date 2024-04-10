import { Style, Stroke, Fill, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { LineFeatureProperties } from '../features';
import { padNumber } from 'ol/string';

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

const textStyle = new Style({
  text: new Text({
    font: '12px "Exo2"',
    placement: 'line',
    textBaseline: 'bottom',
    textAlign: 'center',
    offsetY: -2,
    text: 'FOO',
    overflow: true,
    fill: new Fill({
      color: '#0000FF',
    }),
    stroke: new Stroke({
      width: 3,
      color: '#FFFFFF',
    }),
    rotateWithView: true,
  }),
});

const degreesToString = (degrees: number) => padNumber(degrees, 3, 1).replace('.', ',') + '°';

export function getNavigationLine12Style(feature: FeatureLike, resolution: number, selected: boolean) {
  const props = feature.getProperties() as LineFeatureProperties;
  let minLength = 100000;
  if (resolution < 100) minLength = 10000;
  if (resolution < 40) minLength = 5000;
  if (resolution < 20) minLength = 2000;
  if (resolution < 10) minLength = 1000;
  if (resolution < 5) minLength = 500;
  const styles: Array<Style> = [];
  styles.push(selected ? selectedLineStyle : lineStyle);
  if (props.direction && props.oppositeDirection && props.length && props.length > minLength) {
    const direction1 = Math.min(props.direction ?? -1, props.oppositeDirection ?? -1);
    const direction2 = Math.max(props.direction ?? -1, props.oppositeDirection ?? -1);
    const text = degreesToString(direction1) + ' - ' + degreesToString(direction2);
    textStyle.getText()?.setText(text);
    textStyle.getText()?.setFont(selected ? 'bold 12px "Exo2"' : '12px "Exo2"');
    styles.push(textStyle);
  }
  return styles;
}

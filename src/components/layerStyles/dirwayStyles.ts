import { FeatureLike } from 'ol/Feature';
import { LineString, MultiPoint } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

const lineStyle = new Style({
  stroke: new Stroke({
    color: '#00A0E2',
    width: 2,
  }),
  zIndex: 2,
});

const pointStyle = new Style({
  image: new CircleStyle({
    radius: 4,
    stroke: new Stroke({
      color: '#00A0E2',
      width: 2,
    }),
    fill: new Fill({
      color: '#ffffff',
    }),
  }),
  zIndex: 3,
});

const pointSelectedStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    stroke: new Stroke({
      color: '#00A0E2',
      width: 3,
    }),
    fill: new Fill({
      color: '#ffffff',
    }),
  }),
  zIndex: 3,
});

export function getDirwayStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  const lineString = feature.getGeometry() as LineString;
  const points = new MultiPoint(lineString.getCoordinates());

  const styles: Array<Style> = [];

  lineStyle.getStroke()?.setWidth(selected ? 3 : 2);
  styles.push(lineStyle);

  if (selected) {
    pointSelectedStyle.setGeometry(points);
    styles.push(pointSelectedStyle);
  } else {
    pointStyle.setGeometry(points);
    styles.push(pointStyle);
  }

  return styles;
}

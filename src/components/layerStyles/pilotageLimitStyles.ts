import { FeatureLike } from 'ol/Feature';
import { LineString, Point } from 'ol/geom';
import { Style, Stroke, Fill, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

const lineStyle = new Style({
  stroke: new Stroke({
    color: '#00509B',
    width: 2,
  }),
  zIndex: 1,
});

const westPointStyle = new Style({
  image: new CircleStyle({
    radius: 4,
    stroke: new Stroke({
      color: '#00509B',
      width: 2,
    }),
    fill: new Fill({
      color: '#ffffff',
    }),
  }),
  zIndex: 2,
});

const eastPointStyle = new Style({
  image: new CircleStyle({
    radius: 13,
    fill: new Fill({
      color: '#00509B',
    }),
  }),
  text: new Text({
    font: `bold 12px "Exo2"`,
    placement: 'point',
    text: '',
    fill: new Fill({
      color: '#FFFFFF',
    }),
  }),
  zIndex: 3,
});

function getWestPoint(line: LineString): Point {
  const firstCoord = line.getFirstCoordinate();
  const lastCoord = line.getLastCoordinate();
  return new Point(firstCoord[0] <= lastCoord[0] ? firstCoord : lastCoord);
}

function getEastPoint(line: LineString): Point {
  const firstCoord = line.getFirstCoordinate();
  const lastCoord = line.getLastCoordinate();
  return new Point(firstCoord[0] > lastCoord[0] ? firstCoord : lastCoord);
}

export function getPilotageLimitStyle(feature: FeatureLike) {
  const geom = feature.getGeometry() as LineString;

  westPointStyle.setGeometry(getWestPoint(geom));

  const text = feature.get('numero') ? '' + feature.get('numero') : '';
  eastPointStyle.setGeometry(getEastPoint(geom));
  eastPointStyle.getText()?.setText(text);

  return [lineStyle, westPointStyle, eastPointStyle];
}

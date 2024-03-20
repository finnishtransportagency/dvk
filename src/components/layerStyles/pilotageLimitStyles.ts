import { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { LineString, Point } from 'ol/geom';
import { Style, Stroke, Fill, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

const startLineStyle = new Style({
  stroke: new Stroke({
    color: '#00509B',
    width: 2,
    lineDash: [6, 3],
  }),
  zIndex: 1,
});

const endLineStyle = startLineStyle.clone();

const lineStyle = new Style({
  stroke: new Stroke({
    color: '#00509B',
    width: 2,
  }),
  zIndex: 2,
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
  zIndex: 3,
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
  zIndex: 4,
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

function getBearing(coord1: Coordinate, coord2: Coordinate) {
  const angle = Math.atan2(coord2[1] - coord1[1], coord2[0] - coord1[0]);
  return angle > Math.PI / 2 ? 2.5 * Math.PI - angle : 0.5 * Math.PI - angle;
}

function getLineStartExtension(line: LineString, length: number): LineString {
  const coordinates = line.getCoordinates();
  const angle = getBearing(coordinates[1], coordinates[0]);
  const point = new Point(line.getFirstCoordinate());
  point.translate(length * Math.sin(angle), length * Math.cos(angle));
  return new LineString([line.getFirstCoordinate(), point.getFirstCoordinate()]);
}

function getLineEndExtension(line: LineString, length: number): LineString {
  const coordinates = line.getCoordinates();
  const angle = getBearing(coordinates[coordinates.length - 2], coordinates[coordinates.length - 1]);
  const point = new Point(line.getLastCoordinate());
  point.translate(length * Math.sin(angle), length * Math.cos(angle));
  return new LineString([line.getLastCoordinate(), point.getFirstCoordinate()]);
}

export function getPilotageLimitStyle(feature: FeatureLike, resolution: number) {
  const geom = feature.getGeometry() as LineString;

  westPointStyle.setGeometry(getWestPoint(geom));

  const text = feature.get('numero') ? '' + feature.get('numero') : '';
  eastPointStyle.setGeometry(getEastPoint(geom));
  eastPointStyle.getText()?.setText(text);

  const extensionLength = Math.min(resolution * 50, 500);
  startLineStyle.setGeometry(getLineStartExtension(geom, extensionLength));
  endLineStyle.setGeometry(getLineEndExtension(geom, extensionLength));

  return [lineStyle, westPointStyle, eastPointStyle, startLineStyle, endLineStyle];
}

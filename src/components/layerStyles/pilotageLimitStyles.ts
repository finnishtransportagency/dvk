import { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { LineString, Point } from 'ol/geom';
import { Style, Stroke, Fill, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { PilotageLimitFeatureProperties } from '../features';

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

const westPointSelectedStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    stroke: new Stroke({
      color: '#00509B',
      width: 3,
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

const eastPointSelectedStyle = new Style({
  image: new CircleStyle({
    radius: 15,
    fill: new Fill({
      color: '#00509B',
    }),
  }),
  text: new Text({
    font: `bold 14px "Exo2"`,
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

export function getPilotageLimitStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  const geom = feature.getGeometry() as LineString;
  const props = feature.getProperties() as PilotageLimitFeatureProperties;

  const styles: Array<Style> = [];

  lineStyle.getStroke()?.setWidth(selected ? 3 : 2);
  styles.push(lineStyle);

  if (selected) {
    westPointSelectedStyle.setGeometry(getWestPoint(geom));
    styles.push(westPointSelectedStyle);
  } else {
    westPointStyle.setGeometry(getWestPoint(geom));
    styles.push(westPointStyle);
  }

  const text = props.numero ? '' + props.numero : '';

  if (selected) {
    eastPointSelectedStyle.setGeometry(getEastPoint(geom));
    eastPointSelectedStyle.getText()?.setText(text);
    styles.push(eastPointSelectedStyle);
  } else {
    eastPointStyle.setGeometry(getEastPoint(geom));
    eastPointStyle.getText()?.setText(text);
    styles.push(eastPointStyle);
  }

  const extensionLength = Math.min(resolution * 50, 500);

  startLineStyle.setGeometry(getLineStartExtension(geom, extensionLength));
  startLineStyle.getStroke()?.setWidth(selected ? 3 : 2);
  styles.push(startLineStyle);

  endLineStyle.setGeometry(getLineEndExtension(geom, extensionLength));
  endLineStyle.getStroke()?.setWidth(selected ? 3 : 2);
  styles.push(endLineStyle);

  return styles;
}

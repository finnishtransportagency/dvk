import { FeatureLike } from 'ol/Feature';
import { LineString, Point, Polygon } from 'ol/geom';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import arrowIcon from '../../../theme/img/arrow-right.svg';

let startStyle: Style | undefined = undefined;
let endStyle: Style | undefined = undefined;
const lineDashStyle = new Style({
  stroke: new Stroke({
    color: '#000000',
    width: 1,
    lineDash: [10, 5],
  }),
});

export function getCircleStyle(feature: FeatureLike, resolution: number) {
  if (resolution > 5) {
    return lineDashStyle;
  }
  const diameter = `ø ${feature.getProperties().diameter} m`;
  const geom = feature.getGeometry() as Polygon;
  const xCoordinates = [];
  for (const a of geom.getCoordinates()) {
    for (const b of a) {
      xCoordinates.push(b[0]);
    }
  }
  const maxX = Math.max(...xCoordinates);
  const minX = Math.min(...xCoordinates);
  const point = geom.getInteriorPoint().getCoordinates();
  const lineString = new LineString([
    [maxX, point[1]],
    [minX, point[1]],
  ]);
  const start = lineString.getFirstCoordinate();
  const end = lineString.getLastCoordinate();
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const rotation = Math.atan2(dy, dx);
  const lineStyle = new Style({
    geometry: function () {
      return lineString;
    },
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
      text: diameter,
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
  if (!startStyle) {
    startStyle = new Style({
      geometry: new Point(start),
      image: new Icon({
        src: arrowIcon,
        anchor: [1, 0.5],
        rotateWithView: true,
        rotation: Math.PI - rotation,
      }),
    });
  } else {
    startStyle.setGeometry(new Point(start));
    startStyle.getImage()?.setRotation(Math.PI - rotation);
  }
  if (!endStyle) {
    endStyle = new Style({
      geometry: new Point(end),
      image: new Icon({
        src: arrowIcon,
        anchor: [1, 0.5],
        rotateWithView: true,
        rotation: -rotation,
      }),
    });
  } else {
    endStyle.setGeometry(new Point(end));
    endStyle.getImage()?.setRotation(-rotation);
  }
  return [lineDashStyle, lineStyle, startStyle, endStyle];
}

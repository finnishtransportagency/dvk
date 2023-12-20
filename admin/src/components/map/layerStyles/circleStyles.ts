import { FeatureLike } from 'ol/Feature';
import { LineString, Polygon } from 'ol/geom';
import { Stroke, Style } from 'ol/style';
import { getMeasureLineStyles } from './utils/measureLineStyles';

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
  const measurelineStyles = getMeasureLineStyles(lineString, diameter);

  return [lineDashStyle, ...measurelineStyles];
}

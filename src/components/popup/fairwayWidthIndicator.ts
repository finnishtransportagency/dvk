import { Point, Geometry } from 'ol/geom';
import Feature, { FeatureLike } from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { lineString, bearingToAzimuth, Coord } from '@turf/helpers';
import { along as turf_along } from '@turf/along';
import { lineIntersect as turf_lineIntersect } from '@turf/line-intersect';
import { nearestPointOnLine as turf_nearestPointOnLine } from '@turf/nearest-point-on-line';
import { booleanPointInPolygon as turf_booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { transformTranslate as turf_transformTranslate } from '@turf/transform-translate';
import { length as turf_length } from '@turf/length';
import { distance as turf_distance } from '@turf/distance';
import { bearing as turf_bearing } from '@turf/bearing';
import { Point as turf_Point, LineString as turf_LineString, Polygon as turf_Polygon, Position } from 'geojson';
import { Coordinate } from 'ol/coordinate';
import { MAP } from '../../utils/constants';
import dvkMap from '../DvkMap';

export function addFairwayWidthIndicator(feature: FeatureLike, areaFeatures: FeatureLike[], coordinate: Coordinate) {
  let fairwayWidthLineFeat: Feature<Geometry> | undefined = undefined;
  const format = new GeoJSON();
  const turfLine = format.writeGeometryObject(feature.getGeometry() as Geometry, {
    dataProjection: 'EPSG:4326',
    featureProjection: MAP.EPSG,
  }) as turf_LineString;
  const turfPoint = format.writeGeometryObject(new Point(coordinate) as Geometry, {
    dataProjection: 'EPSG:4326',
    featureProjection: MAP.EPSG,
  }) as turf_Point;

  const pointOnLine = turf_nearestPointOnLine(turfLine, turfPoint);
  if (pointOnLine.properties.index !== undefined && pointOnLine.properties.dist !== undefined && pointOnLine.properties.location !== undefined) {
    /* The point on line nearest to the clicked point */
    const turfSnapPoint = turf_along(turfLine, pointOnLine.properties.location);

    /* Filter areas containing snap point */
    const filteredAreas = areaFeatures.filter((f) => {
      const turfArea = format.writeGeometryObject(f.getGeometry() as Geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      }) as turf_Polygon;
      return turf_booleanPointInPolygon(turfSnapPoint, turfArea);
    });

    /* Continue only if we have only one area polygon that contains snap point */
    if (filteredAreas.length === 1) {
      const turfArea = format.writeGeometryObject(filteredAreas[0].getGeometry() as Geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      }) as turf_Polygon;
      /* Get line azimuth at snap point */
      const azimuth = bearingToAzimuth(
        turf_bearing(turfLine.coordinates[pointOnLine.properties.index], turfLine.coordinates[pointOnLine.properties.index + 1])
      );
      /* Create lines perpendicular navigation to line and length of 5km to both direction from snap point */
      const startPoint = turf_transformTranslate(turfSnapPoint, 5, azimuth >= 90 ? azimuth - 90 : azimuth - 90 + 360);
      const endPoint = turf_transformTranslate(turfSnapPoint, 5, azimuth <= 270 ? azimuth + 90 : azimuth + 90 - 360);

      const turfStartPerpendicularLine = lineString([turfSnapPoint.geometry.coordinates, startPoint.geometry.coordinates]);
      const turfEndPerpendicularLine = lineString([turfSnapPoint.geometry.coordinates, endPoint.geometry.coordinates]);

      /* Find perpendicular lines and fairway area polygon intersections */
      const startInterSectionPoints = turf_lineIntersect(turfStartPerpendicularLine, turfArea);
      const startIntersectionPointsArray = startInterSectionPoints.features.map((d) => {
        return d.geometry.coordinates;
      });
      const endInterSectionPoints = turf_lineIntersect(turfEndPerpendicularLine, turfArea);
      const endIntersectionPointsArray = endInterSectionPoints.features.map((d) => {
        return d.geometry.coordinates;
      });
      /* Find start and end intersection points nearest to the snap point */

      const startCoord = getNearestCoord(startIntersectionPointsArray, turfSnapPoint);
      const endCoord = getNearestCoord(endIntersectionPointsArray, turfSnapPoint);

      if (startCoord && endCoord) {
        const turfFairwayWidthLine = lineString([startCoord, endCoord]);
        const fairwayWidth = turf_length(turfFairwayWidthLine) * 1000;

        fairwayWidthLineFeat = format.readFeature(turfFairwayWidthLine, {
          dataProjection: 'EPSG:4326',
          featureProjection: MAP.EPSG,
        }) as Feature<Geometry>;
        fairwayWidthLineFeat.setProperties({ width: fairwayWidth });

        dvkMap.getFeatureLayer('fairwaywidth').setVisible(true);
        const source = dvkMap.getVectorSource('fairwaywidth');
        source.clear();
        source.addFeature(fairwayWidthLineFeat);
      }
    }
  }
  return fairwayWidthLineFeat;
}

function getNearestCoord(pointArray: Position[], snapPoint: Coord, minDistance: number = 5) {
  let minDist = minDistance;
  let coordFound = undefined;
  for (const coord of pointArray) {
    const dist = turf_distance(snapPoint, coord);
    if (dist < minDist) {
      coordFound = coord;
      minDist = dist;
    }
  }
  return coordFound;
}

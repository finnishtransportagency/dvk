import { Point, Geometry } from 'ol/geom';
import Feature, { FeatureLike } from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { lineString, bearingToAzimuth } from '@turf/helpers';
import along from '@turf/along';
import lineIntersect from '@turf/line-intersect';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import transformTranslate from '@turf/transform-translate';
import length from '@turf/length';
import distance from '@turf/distance';
import bearing from '@turf/bearing';
import { Point as turf_Point, LineString as turf_LineString, Polygon as turf_Polygon } from 'geojson';
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

  const pointOnLine = nearestPointOnLine(turfLine, turfPoint);
  if (pointOnLine.properties.index !== undefined && pointOnLine.properties.dist !== undefined && pointOnLine.properties.location !== undefined) {
    /* The point on line nearest to the clicked point */
    const turfSnapPoint = along(turfLine, pointOnLine.properties.location);

    /* Filter areas containing snap point */
    const filteredAreas = areaFeatures.filter((f) => {
      const turfArea = format.writeGeometryObject(f.getGeometry() as Geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      }) as turf_Polygon;
      return booleanPointInPolygon(turfSnapPoint, turfArea);
    });

    /* Continue only if we have only one area polygon that contains snap point */
    if (filteredAreas.length === 1) {
      const turfArea = format.writeGeometryObject(filteredAreas[0].getGeometry() as Geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      }) as turf_Polygon;
      /* Get line azimuth at snap point */
      const azimuth = bearingToAzimuth(
        bearing(turfLine.coordinates[pointOnLine.properties.index], turfLine.coordinates[pointOnLine.properties.index + 1])
      );
      /* Create lines perpendicular navigation to line and length of 5km to both direction from snap point */
      const startPoint = transformTranslate(turfSnapPoint, 5, azimuth >= 90 ? azimuth - 90 : azimuth - 90 + 360);
      const endPoint = transformTranslate(turfSnapPoint, 5, azimuth <= 270 ? azimuth + 90 : azimuth + 90 - 360);

      const turfStartPerpendicularLine = lineString([turfSnapPoint.geometry.coordinates, startPoint.geometry.coordinates]);
      const turfEndPerpendicularLine = lineString([turfSnapPoint.geometry.coordinates, endPoint.geometry.coordinates]);

      /* Find perpendicular lines and fairway area polygon intersections */
      const startInterSectionPoints = lineIntersect(turfStartPerpendicularLine, turfArea);
      const startIntersectionPointsArray = startInterSectionPoints.features.map((d) => {
        return d.geometry.coordinates;
      });
      const endInterSectionPoints = lineIntersect(turfEndPerpendicularLine, turfArea);
      const endIntersectionPointsArray = endInterSectionPoints.features.map((d) => {
        return d.geometry.coordinates;
      });
      /* Find start and end intersection points nearest to the snap point */
      let minDist = 5;
      let startCoord = undefined;
      for (const coord of startIntersectionPointsArray) {
        const dist = distance(turfSnapPoint, coord);
        if (dist < minDist) {
          startCoord = coord;
          minDist = dist;
        }
      }
      minDist = 5;
      let endCoord = undefined;
      for (const coord of endIntersectionPointsArray) {
        const dist = distance(turfSnapPoint, coord);
        if (dist < minDist) {
          endCoord = coord;
          minDist = dist;
        }
      }

      if (startCoord && endCoord) {
        const turfFairwayWidthLine = lineString([startCoord, endCoord]);
        const fairwayWidth = length(turfFairwayWidthLine) * 1000;

        fairwayWidthLineFeat = format.readFeature(turfFairwayWidthLine, {
          dataProjection: 'EPSG:4326',
          featureProjection: MAP.EPSG,
        });
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

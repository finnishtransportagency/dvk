import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import * as turf from '@turf/turf';
import { intersects } from 'ol/extent';

const createFeature = (featCoords: Array<turf.Position>, area1Properties: object | null, area2Properties: object | null) => {
  const format = new GeoJSON();
  const feat = format.readFeature(turf.lineString(featCoords), {
    dataProjection: 'EPSG:4326',
    featureProjection: MAP.EPSG,
  });
  feat.setProperties({ area1Properties: area1Properties }, true);
  feat.setProperties({ area2Properties: area2Properties }, true);
  return feat;
};

export function getFairwayAreaBorderFeatures(areas: Feature<Geometry>[]) {
  const format = new GeoJSON();
  const borderLineFeatures: Feature<Geometry>[] = [];
  const turfPolygons: Array<turf.Polygon> = [];
  const turfPolygonsLineSegments: Array<turf.FeatureCollection> = [];

  areas.forEach((area, i) => {
    turfPolygons[i] = format.writeGeometryObject(area.getGeometry() as Geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: MAP.EPSG,
    }) as turf.Polygon;
    turfPolygonsLineSegments[i] = turf.lineSegment(turfPolygons[i]);
  });

  areas.forEach((area1, i) => {
    const intersectedSegmenIndices: Array<number> = [];
    const area1Extent = area1.getGeometry()?.getExtent();
    areas.forEach((area2, j) => {
      // Do not self compare
      if (area1.getProperties().id === area2.getProperties().id) return;

      const area2Extent = area2.getGeometry()?.getExtent();
      if (!area1Extent || !area2Extent || !intersects(area1Extent, area2Extent)) return;

      let featCoords: Array<turf.Position> = [];
      for (let k = 0; k < turfPolygonsLineSegments[i].features.length; k++) {
        if (intersectedSegmenIndices.includes(k)) {
          if (featCoords.length > 1) {
            borderLineFeatures.push(createFeature(featCoords, area1.getProperties(), area2.getProperties()));
          }
          featCoords = [];
          continue;
        }
        const segmentLineString = turfPolygonsLineSegments[i].features[k].geometry as turf.LineString;
        const turfOverlappingSegment = turf.lineOverlap(segmentLineString, turfPolygons[j], { tolerance: 0.002 });
        // Do not consider polygon edge overlapping if segment length is small (for example polygon touches only in corner)
        const turfOverlapFeatures = turfOverlappingSegment.features.filter((v) => turf.length(v) > 0.002);
        if (turfOverlapFeatures.length > 0) {
          intersectedSegmenIndices.push(k);
          if (i > j) continue;
          if (featCoords.length < 1) {
            featCoords.push(segmentLineString.coordinates[0]);
          }
          featCoords.push(segmentLineString.coordinates[1]);
        } else if (featCoords.length > 1) {
          borderLineFeatures.push(createFeature(featCoords, area1.getProperties(), area2.getProperties()));
          featCoords = [];
        }
      }
      if (featCoords.length > 1) {
        borderLineFeatures.push(createFeature(featCoords, area1.getProperties(), area2.getProperties()));
      }
    });

    let featCoords: Array<turf.Position> = [];
    for (let k = 0; k < turfPolygonsLineSegments[i].features.length; k++) {
      if (intersectedSegmenIndices.includes(k)) {
        if (featCoords.length > 1) {
          borderLineFeatures.push(createFeature(featCoords, area1.getProperties(), null));
        }
        featCoords = [];
        continue;
      }
      const segmentLineString = turfPolygonsLineSegments[i].features[k].geometry as turf.LineString;
      if (featCoords.length < 1) {
        featCoords.push(segmentLineString.coordinates[0]);
      }
      featCoords.push(segmentLineString.coordinates[1]);
    }
    if (featCoords.length > 1) {
      borderLineFeatures.push(createFeature(featCoords, area1.getProperties(), null));
    }
  });
  return borderLineFeatures;
}

import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import { lineString } from '@turf/helpers';
import lineSegment from '@turf/line-segment';
import lineOverlap from '@turf/line-overlap';
import length from '@turf/length';
import {
  Position as turf_Position,
  LineString as turf_LineString,
  Polygon as turf_Polygon,
  FeatureCollection as turf_FeatureCollection,
} from 'geojson';
import { intersects } from 'ol/extent';

function createFeature(featCoords: Array<turf_Position>, area1Properties: object | null, area2Properties: object | null) {
  const format = new GeoJSON();
  const feat = format.readFeature(lineString(featCoords), {
    dataProjection: 'EPSG:4326',
    featureProjection: MAP.EPSG,
  });
  feat.setProperties({ area1Properties: area1Properties }, true);
  feat.setProperties({ area2Properties: area2Properties }, true);
  return feat;
}

function getAreaBorderlineFeatures(
  areas: Feature<Geometry>[],
  index: number,
  turfPolygonLineSegments: turf_FeatureCollection<turf_LineString>,
  segmentsNeighbour: Array<number | null>
) {
  const borderLineFeatures: Feature<Geometry>[] = [];
  let featCoords: Array<turf_Position> = [];
  for (let k = 0; k < turfPolygonLineSegments.features.length; k++) {
    const segmentLineString = turfPolygonLineSegments.features[k].geometry;
    if (featCoords.length < 1) {
      featCoords.push(segmentLineString.coordinates[0]);
    }
    featCoords.push(segmentLineString.coordinates[1]);

    if (k === turfPolygonLineSegments.features.length - 1 || segmentsNeighbour[k + 1] !== segmentsNeighbour[k]) {
      const index2 = segmentsNeighbour[k];
      if (index2 === null) {
        borderLineFeatures.push(createFeature(featCoords, areas[index].getProperties(), null));
      } else if (index2 > index) {
        borderLineFeatures.push(createFeature(featCoords, areas[index].getProperties(), areas[index2].getProperties()));
      }
      featCoords = [];
    }
  }
  return borderLineFeatures;
}

export function getFairwayAreaBorderFeatures(areas: Feature<Geometry>[]) {
  const format = new GeoJSON();
  const borderLineFeatures: Feature<Geometry>[] = [];
  const turfPolygons: Array<turf_Polygon> = [];

  areas.forEach((area, i) => {
    turfPolygons[i] = format.writeGeometryObject(area.getGeometry() as Geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: MAP.EPSG,
    }) as turf_Polygon;
  });

  areas.forEach((area1, i) => {
    const turfPolygonLineSegments = lineSegment(turfPolygons[i]);
    const segmentsNeighbour: Array<number | null> = Array(turfPolygonLineSegments.features.length).fill(null);
    const area1Extent = area1.getGeometry()?.getExtent();

    areas.forEach((area2, j) => {
      // Do not self compare
      if (area1.getProperties().id === area2.getProperties().id) return;

      const area2Extent = area2.getGeometry()?.getExtent();
      if (!area1Extent || !area2Extent || !intersects(area1Extent, area2Extent)) return;

      turfPolygonLineSegments.features.forEach((turfPolygonLineSegment, k) => {
        if (segmentsNeighbour[k] === null) {
          const segmentLineString = turfPolygonLineSegment.geometry;
          const turfOverlappingSegment = lineOverlap(segmentLineString, turfPolygons[j], { tolerance: 0.002 });
          // Do not consider polygon edge overlapping if segment length is small (for example polygon touches only in corner)
          const turfOverlapFeatures = turfOverlappingSegment.features.filter((v) => length(v) > 0.002);
          if (turfOverlapFeatures.length > 0) {
            segmentsNeighbour[k] = j;
          }
        }
      });
    });
    borderLineFeatures.push(...getAreaBorderlineFeatures(areas, i, turfPolygonLineSegments, segmentsNeighbour));
  });
  return borderLineFeatures;
}

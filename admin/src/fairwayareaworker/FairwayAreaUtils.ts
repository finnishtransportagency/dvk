import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import { lineString } from '@turf/helpers';
import { lineSegment as turf_lineSegment } from '@turf/line-segment';
import { lineOverlap as turf_lineOverlap } from '@turf/line-overlap';
import { length as turf_length } from '@turf/length';
import {
  Position as turf_Position,
  LineString as turf_LineString,
  Polygon as turf_Polygon,
  FeatureCollection as turf_FeatureCollection,
} from 'geojson';
import { Extent, intersects } from 'ol/extent';

function createFeature(featCoords: Array<turf_Position>, area1Properties: object | null, area2Properties: object | null) {
  const format = new GeoJSON();
  const feat = format.readFeature(lineString(featCoords), {
    dataProjection: 'EPSG:4326',
    featureProjection: MAP.EPSG,
  }) as Feature<Geometry>;
  feat.setProperties(
    {
      area1Properties: area1Properties,
      area2Properties: area2Properties,
    },
    true
  );
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
  const areaExtents: Array<Extent | undefined> = [];

  areas.forEach((area, i) => {
    turfPolygons[i] = format.writeGeometryObject(area.getGeometry() as Geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: MAP.EPSG,
    }) as turf_Polygon;
    areaExtents[i] = area.getGeometry()?.getExtent();
  });

  const closeAreaPairs: Array<{ a: number; b: number }> = [];

  for (let i = 0; i < areaExtents.length; i++) {
    const ae1 = areaExtents[i];
    if (ae1) {
      for (let j = i + 1; j < areaExtents.length; j++) {
        const ae2 = areaExtents[j];
        if (ae2 && intersects(ae1, ae2)) {
          closeAreaPairs.push({ a: i, b: j });
        }
      }
    }
  }

  turfPolygons.forEach((turfPolygon, i) => {
    const turfPolygonLineSegments = turf_lineSegment(turfPolygon);
    const segmentsNeighbour: Array<number | null> = Array(turfPolygonLineSegments.features.length).fill(null);

    const closeIds: Array<number> = [];
    for (const closeAreaPair of closeAreaPairs) {
      if (closeAreaPair.a === i) {
        closeIds.push(closeAreaPair.b);
      } else if (closeAreaPair.b === i) {
        closeIds.push(closeAreaPair.a);
      }
    }

    for (const closeId of closeIds) {
      turfPolygonLineSegments.features.forEach((turfPolygonLineSegment, k) => {
        if (segmentsNeighbour[k] === null) {
          const segmentLineString = turfPolygonLineSegment.geometry;
          const turfOverlappingSegment = turf_lineOverlap(segmentLineString, turfPolygons[closeId], { tolerance: 0.002 });
          // Do not consider polygon edge overlapping if segment length is small (for example polygon touches only in corner)
          const turfOverlapFeatures = turfOverlappingSegment.features.filter((v) => turf_length(v) > 0.002);
          if (turfOverlapFeatures.length > 0) {
            segmentsNeighbour[k] = closeId;
          }
        }
      });
    }
    borderLineFeatures.push(...getAreaBorderlineFeatures(areas, i, turfPolygonLineSegments, segmentsNeighbour));
  });
  return borderLineFeatures;
}

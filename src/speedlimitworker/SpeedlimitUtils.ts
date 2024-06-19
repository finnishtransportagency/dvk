import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import { intersect as turf_intersect } from '@turf/intersect';
import { difference as turf_difference } from '@turf/difference';
import { area as turf_area } from '@turf/area';
import { flatten as turf_flatten } from '@turf/flatten';
import { union as turf_union } from '@turf/union';
import { truncate as turf_truncate } from '@turf/truncate';
import * as turf_helpers from '@turf/helpers';
import {
  Feature as turf_Feature,
  Polygon as turf_Polygon,
  MultiPolygon as turf_MultiPolygon,
  GeoJsonProperties as turf_GeoJsonProperties,
} from 'geojson';
import { intersects } from 'ol/extent';

function getSpeedLimitFairwayAreas(rafs: Feature<Geometry>[], fafs: Feature<Geometry>[]): Feature<Geometry>[] {
  return fafs.filter((faf) => {
    const fafExtent = faf.getGeometry()?.getExtent();
    for (const raf of rafs) {
      const rafExtent = raf.getGeometry()?.getExtent();
      if (rafExtent && fafExtent && intersects(rafExtent, fafExtent)) {
        return true;
      }
    }
    return false;
  });
}

type SpeedLimitGeometry = {
  speedLimits: Array<number>;
  geometry: turf_Feature<turf_Polygon | turf_MultiPolygon, turf_GeoJsonProperties>;
};

function getSpeedLimitGeometries(rafs: Feature<Geometry>[]): Array<SpeedLimitGeometry> {
  let speedLimitGeometries: Array<SpeedLimitGeometry> = [];
  const multiSpeedLimitGeometries: Array<SpeedLimitGeometry> = [];
  const format = new GeoJSON();

  for (const raf of rafs) {
    const diffSpeedLimitGeometries: Array<SpeedLimitGeometry> = [];
    const speedLimit = raf.getProperties().value;
    const raGeomPoly = format.writeFeatureObject(raf) as turf_Feature<turf_Polygon>;
    let overlapGeomIndices: Array<number> = [];
    const intersections = [];

    for (let i = 0; i < speedLimitGeometries.length; i++) {
      const slg = speedLimitGeometries[i].geometry;
      const intersection = turf_intersect(turf_helpers.featureCollection([raGeomPoly, slg]));
      if (intersection) {
        intersections.push(intersection);
        overlapGeomIndices.push(i);
        const intersectionPolygons = turf_flatten(intersection);
        for (const feat of intersectionPolygons.features) {
          const geom = turf_helpers.feature(feat.geometry);
          multiSpeedLimitGeometries.push({
            speedLimits: [speedLimit, ...speedLimitGeometries[i].speedLimits],
            geometry: geom,
          });
        }
        const diff2 = turf_difference(turf_helpers.featureCollection([slg, intersection]));
        if (diff2) {
          for (const feat of turf_flatten(diff2).features) {
            if (turf_area(feat.geometry) > 100000) {
              diffSpeedLimitGeometries.push({ speedLimits: speedLimitGeometries[i].speedLimits, geometry: turf_helpers.feature(feat.geometry) });
            }
          }
        }
      }
    }

    if (overlapGeomIndices.length === 0) {
      speedLimitGeometries.push({ speedLimits: [speedLimit], geometry: raGeomPoly });
    } else {
      speedLimitGeometries = speedLimitGeometries.filter((_, index) => !overlapGeomIndices.includes(index));
      overlapGeomIndices = [];
      let diff: turf_Feature<turf_Polygon | turf_MultiPolygon, turf_GeoJsonProperties> = raGeomPoly;
      for (const intersection of intersections) {
        const diff1 = turf_difference(turf_helpers.featureCollection([diff, intersection]));
        if (diff1) {
          diff = diff1;
        }
      }
      for (const feat of turf_flatten(diff).features) {
        if (turf_area(feat.geometry) > 100000) {
          diffSpeedLimitGeometries.push({ speedLimits: [speedLimit], geometry: turf_helpers.feature(feat.geometry) });
        }
      }
    }
    speedLimitGeometries = [...speedLimitGeometries, ...diffSpeedLimitGeometries];
  }
  return [...speedLimitGeometries, ...multiSpeedLimitGeometries];
}

/* Input projection EPSG:4326, output projection MAP.EPSG */
export function getSpeedLimitFeatures(rafs: Feature<Geometry>[], fafs: Feature<Geometry>[]) {
  const speedLimitFeatures: Feature<Geometry>[] = [];
  const format = new GeoJSON();
  // Filter out restriction areas without speed limit value
  rafs = rafs.filter((raf) => raf.getProperties().value !== null);
  // Filter out fairway areas that extent does not intersect any speed limit area extent
  fafs = getSpeedLimitFairwayAreas(rafs, fafs);

  for (const slg of getSpeedLimitGeometries(rafs)) {
    const raGeomPoly = slg.geometry;
    const intersectionPolygons = [];

    for (const faf of fafs) {
      const aGeomPoly = format.writeFeatureObject(faf) as turf_Feature<turf_Polygon>;
      const intersection = turf_intersect(turf_helpers.featureCollection([raGeomPoly, aGeomPoly]));
      if (intersection) {
        intersectionPolygons.push(turf_truncate(intersection));
      }
    }
    if (intersectionPolygons.length < 1) {
      continue; /* Speed limit polygon does not intersect with any fairway area polygon */
    }

    let intersectionUnion = intersectionPolygons[0];

    for (let i = 1; i < intersectionPolygons.length; i++) {
      const u = turf_union(turf_helpers.featureCollection([intersectionUnion, intersectionPolygons[i]]));
      if (u) {
        intersectionUnion = u;
      }
    }

    const flattenIntersectionUnion = turf_flatten(intersectionUnion);

    for (const union of flattenIntersectionUnion.features) {
      const feat = format.readFeature(union.geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      });
      feat.setProperties({ speedLimits: slg.speedLimits });
      speedLimitFeatures.push(feat);
    }
  }
  return speedLimitFeatures;
}

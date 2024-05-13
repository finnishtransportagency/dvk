import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import intersect from '@turf/intersect';
import difference from '@turf/difference';
import area from '@turf/area';
import flatten from '@turf/flatten';
import union from '@turf/union';
import truncate from '@turf/truncate';
import * as turf_helpers from '@turf/helpers';
import { Polygon as turf_Polygon } from 'geojson';
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
  geometry: turf_Polygon | turf_helpers.Feature<turf_helpers.Polygon | turf_helpers.MultiPolygon, turf_helpers.Properties>;
};

function getSpeedLimitGeometries(rafs: Feature<Geometry>[]): Array<SpeedLimitGeometry> {
  let speedLimitGeometries: Array<SpeedLimitGeometry> = [];
  const multiSpeedLimitGeometries: Array<SpeedLimitGeometry> = [];
  const format = new GeoJSON();

  for (const raf of rafs) {
    const diffSpeedLimitGeometries: Array<SpeedLimitGeometry> = [];
    const speedLimit = raf.getProperties().value;
    const raGeomPoly = format.writeGeometryObject(raf.getGeometry() as Geometry);
    let overlapGeomIndices: Array<number> = [];
    const intersections = [];

    for (let i = 0; i < speedLimitGeometries.length; i++) {
      const slg = speedLimitGeometries[i].geometry;
      const intersection = intersect(raGeomPoly as turf_Polygon, slg as turf_Polygon);
      if (intersection) {
        intersections.push(intersection);
        overlapGeomIndices.push(i);
        const intersectionPolygons = flatten(intersection);
        for (const feat of intersectionPolygons.features) {
          const geom = feat.geometry;
          multiSpeedLimitGeometries.push({
            speedLimits: [speedLimit, ...speedLimitGeometries[i].speedLimits],
            geometry: geom,
          });
        }
        const diff2 = difference(slg, intersection);
        if (diff2) {
          for (const feat of flatten(diff2).features) {
            if (area(feat.geometry) > 100000) {
              diffSpeedLimitGeometries.push({ speedLimits: speedLimitGeometries[i].speedLimits, geometry: feat.geometry });
            }
          }
        }
      }
    }

    if (overlapGeomIndices.length === 0) {
      speedLimitGeometries.push({ speedLimits: [speedLimit], geometry: raGeomPoly as turf_Polygon });
    } else {
      speedLimitGeometries = speedLimitGeometries.filter((_, index) => !overlapGeomIndices.includes(index));
      overlapGeomIndices = [];
      let diff: turf_Polygon | turf_helpers.Feature<turf_helpers.Polygon | turf_helpers.MultiPolygon, turf_helpers.Properties> =
        raGeomPoly as turf_Polygon;
      for (const intersection of intersections) {
        const diff1 = difference(diff, intersection);
        if (diff1) {
          diff = diff1;
        }
      }
      for (const feat of flatten(diff).features) {
        if (area(feat.geometry) > 100000) {
          diffSpeedLimitGeometries.push({ speedLimits: [speedLimit], geometry: feat.geometry });
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
      const aGeomPoly = format.writeGeometryObject(faf.getGeometry() as Geometry);
      const intersection = intersect(raGeomPoly as turf_Polygon, aGeomPoly as turf_Polygon);
      if (intersection) {
        intersectionPolygons.push(truncate(intersection));
      }
    }
    if (intersectionPolygons.length < 1) {
      continue; /* Speed limit polygon does not intersect with any fairway area polygon */
    }

    let intersectionUnion = intersectionPolygons[0];

    for (let i = 1; i < intersectionPolygons.length; i++) {
      const u = union(intersectionUnion, intersectionPolygons[i]);
      if (u) {
        intersectionUnion = u;
      }
    }

    const flattenIntersectionUnion = flatten(intersectionUnion);

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

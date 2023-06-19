import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import * as turf from '@turf/turf';
import { intersects } from 'ol/extent';

/* Input projection EPSG:4326, output projection MAP.EPSG */
export function getSpeedLimitFeatures(rafs: Feature<Geometry>[], fafs: Feature<Geometry>[]) {
  const speedLimitFeatures: Feature<Geometry>[] = [];
  const format = new GeoJSON();

  const speedLimitFafs: Feature<Geometry>[] = [];
  for (const faf of fafs) {
    const fafExtent = faf.getGeometry()?.getExtent();
    for (const raf of rafs) {
      const speedLimit = raf.getProperties().value;
      const rafExtent = raf.getGeometry()?.getExtent();
      if (speedLimit && rafExtent && fafExtent && intersects(rafExtent, fafExtent)) {
        speedLimitFafs.push(faf);
        break;
      }
    }
  }

  const speedLimitGeometries: {
    speedLimit: number;
    geometry: turf.Polygon | turf.helpers.Feature<turf.helpers.Polygon | turf.helpers.MultiPolygon, turf.helpers.Properties>;
  }[] = [];

  for (const raf of rafs) {
    const speedLimit = raf.getProperties().value;
    // Only analyse restriction areas with speed limit value
    if (speedLimit === null) {
      continue;
    }

    const raGeomPoly = format.writeGeometryObject(raf.getGeometry() as Geometry);

    const index = speedLimitGeometries.findIndex((slg) => slg.speedLimit === speedLimit);
    if (index < 0) {
      speedLimitGeometries.push({ speedLimit: speedLimit, geometry: raGeomPoly as turf.Polygon });
    } else {
      const union = turf.union(speedLimitGeometries[index].geometry, raGeomPoly as turf.Polygon);
      if (union) {
        speedLimitGeometries[index].geometry = union;
      }
    }
  }

  for (const slg of speedLimitGeometries) {
    const speedLimit = slg.speedLimit;
    const raGeomPoly = slg.geometry;
    const intersectionPolygons = [];

    for (const faf of speedLimitFafs) {
      const aGeomPoly = format.writeGeometryObject(faf.getGeometry() as Geometry);
      const intersection = turf.intersect(raGeomPoly as turf.Polygon, aGeomPoly as turf.Polygon);
      if (intersection) {
        intersectionPolygons.push(turf.truncate(intersection));
      }
    }

    if (intersectionPolygons.length < 1) {
      continue; /* Speed limit polygon does not intersect with any fairway area polygon */
    }

    let intersectionUnion = intersectionPolygons[0];

    for (let i = 1; i < intersectionPolygons.length; i++) {
      const union = turf.union(intersectionUnion, intersectionPolygons[i]);
      if (union) {
        intersectionUnion = union;
      }
    }

    const flattenIntersectionUnion = turf.flatten(intersectionUnion);

    for (const union of flattenIntersectionUnion.features) {
      const feat = format.readFeature(union.geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      });
      feat.setProperties({ speedLimit: speedLimit });
      speedLimitFeatures.push(feat);
    }
  }
  return speedLimitFeatures;
}

import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import * as turf from '@turf/turf';
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
  speedLimit: number;
  geometry: turf.Polygon | turf.helpers.Feature<turf.helpers.Polygon | turf.helpers.MultiPolygon, turf.helpers.Properties>;
};

function getSpeedLimitGeometries(rafs: Feature<Geometry>[]): Array<SpeedLimitGeometry> {
  const speedLimitGeometries: Array<SpeedLimitGeometry> = [];
  const format = new GeoJSON();

  for (const raf of rafs) {
    const speedLimit = raf.getProperties().value;
    const raGeomPoly = format.writeGeometryObject(raf.getGeometry() as Geometry);

    const speedLimitGeometry = speedLimitGeometries.find((slg) => slg.speedLimit === speedLimit);
    if (speedLimitGeometry) {
      const union = turf.union(speedLimitGeometry.geometry, raGeomPoly as turf.Polygon);
      if (union) {
        speedLimitGeometry.geometry = union;
      }
    } else {
      speedLimitGeometries.push({ speedLimit: speedLimit, geometry: raGeomPoly as turf.Polygon });
    }
  }
  return speedLimitGeometries;
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
      }) as Feature<Geometry>;
      feat.setProperties({ speedLimit: slg.speedLimit });
      speedLimitFeatures.push(feat);
    }
  }
  return speedLimitFeatures;
}

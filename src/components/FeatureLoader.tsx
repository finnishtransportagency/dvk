import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import * as turf from '@turf/turf';
import { FeatureDataId, FeatureDataLayerId, MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { intersects } from 'ol/extent';
import { useFeatureData } from '../utils/dataLoader';
import { useEffect, useState } from 'react';
import { Text } from '../graphql/generated';

function useDataLayer(
  featureDataId: FeatureDataId,
  featureLayerId: FeatureDataLayerId,
  dataProjection = 'EPSG:4326',
  refetchOnMount: 'always' | boolean = true,
  refetchInterval: number | false = false,
  clearSource = true
) {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useFeatureData(featureDataId, refetchOnMount, refetchInterval);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource(featureLayerId);
        if (clearSource) {
          source.clear();
        }
        features.forEach((f) => f.set('dataSource', featureLayerId, true));
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [featureLayerId, data, dataUpdatedAt, dataProjection, clearSource]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useLine12Layer() {
  return useDataLayer('line12', 'line12');
}

export function useLine3456Layer() {
  return useDataLayer('line3456', 'line3456');
}

export function useNameLayer() {
  const seaReady = useDataLayer('seaname', 'name', 'EPSG:4326', true, false, false);
  const groundReady = useDataLayer('groundname', 'name', 'EPSG:4326', true, false, false);
  return seaReady && groundReady;
}

export function useBoardLine12Layer() {
  return useDataLayer('boardline12', 'boardline12');
}

export function useMareographLayer() {
  return useDataLayer('mareograph', 'mareograph', 'EPSG:4326', 'always', 1000 * 60 * 5);
}

export function useObservationLayer() {
  return useDataLayer('observation', 'observation', 'EPSG:4326', 'always', 1000 * 60 * 5);
}

export function useBuoyLayer() {
  return useDataLayer('buoy', 'buoy', 'EPSG:4326', 'always', 1000 * 60 * 5);
}

function addSpeedLimits(fafs: Feature<Geometry>[], rafs: Feature<Geometry>[]) {
  const format = new GeoJSON();
  for (const raf of rafs) {
    const speedLimit = raf.getProperties().value;
    // Only analyse restriction areas with speed limit value
    if (speedLimit === null) {
      continue;
    }
    const rafExtent = raf.getGeometry()?.getExtent();
    const raGeomPoly = format.writeGeometryObject(raf.getGeometry() as Geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });

    for (const faf of fafs) {
      const fafExtent = faf.getGeometry()?.getExtent();
      // No need to analyze more if bounding boxes do not intersect
      if (!rafExtent || !fafExtent || !intersects(rafExtent, fafExtent)) {
        continue;
      }

      const aGeomPoly = format.writeGeometryObject(faf.getGeometry() as Geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      // Check if fairway area polygone intersects restriction area polygone
      if (!turf.booleanDisjoint(raGeomPoly as turf.Polygon, aGeomPoly as turf.Polygon)) {
        const oldSpeedLimit = faf.get('speedLimit') as number[] | undefined;
        if (oldSpeedLimit) {
          oldSpeedLimit.push(speedLimit);
        } else {
          faf.setProperties({ speedLimit: [speedLimit] });
        }
      }
    }
  }
}

export function useArea12Layer() {
  const [ready, setReady] = useState(false);
  const aQuery = useFeatureData('area12');
  const raQuery = useFeatureData('restrictionarea');
  const dataUpdatedAt = Math.max(aQuery.dataUpdatedAt, raQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(aQuery.errorUpdatedAt, raQuery.errorUpdatedAt);
  const isPaused = aQuery.isPaused || raQuery.isPaused;
  const isError = aQuery.isError || raQuery.isError;

  useEffect(() => {
    const aData = aQuery.data;
    const raData = raQuery.data;
    if (aData && raData) {
      const layer = dvkMap.getFeatureLayer('area12');
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const afs = format.readFeatures(aData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        const rafs = format.readFeatures(raData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        addSpeedLimits(afs, rafs);
        afs.forEach((f) => f.set('dataSource', 'area12', true));
        const source = dvkMap.getVectorSource('area12');
        source.clear();
        source.addFeatures(afs);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [aQuery.data, raQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useArea3456Layer() {
  return useDataLayer('area3456', 'area3456');
}

export function useDepth12Layer() {
  return useDataLayer('depth12', 'depth12');
}

function getSpeedLimitFeatures(rafs: Feature<Geometry>[], fafs: Feature<Geometry>[]) {
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

    const raGeomPoly = format.writeGeometryObject(raf.getGeometry() as Geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });

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
      const aGeomPoly = format.writeGeometryObject(faf.getGeometry() as Geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
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

export function useSpeedLimitLayer() {
  const [ready, setReady] = useState(false);
  const aQuery = useFeatureData('area12');
  const raQuery = useFeatureData('restrictionarea');
  const dataUpdatedAt = Math.max(aQuery.dataUpdatedAt, raQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(aQuery.errorUpdatedAt, raQuery.errorUpdatedAt);
  const isPaused = aQuery.isPaused || raQuery.isPaused;
  const isError = aQuery.isError || raQuery.isError;

  useEffect(() => {
    const aData = aQuery.data;
    const raData = raQuery.data;
    if (aData && raData) {
      const layer = dvkMap.getFeatureLayer('speedlimit');
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const afs = format.readFeatures(aData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        const rafs = format.readFeatures(raData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        const speedLimitFeatures = getSpeedLimitFeatures(rafs, afs);
        const source = dvkMap.getVectorSource('speedlimit');
        source.clear();
        source.addFeatures(speedLimitFeatures);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [aQuery.data, raQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useSpecialAreaLayer() {
  return useDataLayer('specialarea', 'specialarea');
}

export function usePilotLayer() {
  return useDataLayer('pilot', 'pilot');
}

export function useHarborLayer() {
  return useDataLayer('harbor', 'harbor');
}

export function useMarineWarningLayer() {
  return useDataLayer('marinewarning', 'marinewarning', 'EPSG:3395');
}

export type EquipmentFault = {
  faultId: number;
  faultType: Text;
  faultTypeCode: string;
  recordTime: number;
};

export function useSafetyEquipmentLayer() {
  const [ready, setReady] = useState(false);
  const eQuery = useFeatureData('safetyequipment');
  const fQuery = useFeatureData('safetyequipmentfault');
  const dataUpdatedAt = Math.max(eQuery.dataUpdatedAt, fQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(eQuery.errorUpdatedAt, fQuery.errorUpdatedAt);
  const isPaused = eQuery.isPaused || fQuery.isPaused;
  const isError = eQuery.isError || fQuery.isError;

  useEffect(() => {
    const eData = eQuery.data;
    const fData = fQuery.data;
    if (eData && fData) {
      const layer = dvkMap.getFeatureLayer('safetyequipment');
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const efs = format.readFeatures(eData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        const ffs = format.readFeatures(fData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource('safetyequipment');
        source.clear();
        source.addFeatures(efs);
        const faultMap = new Map<number, EquipmentFault[]>();
        for (const ff of ffs) {
          const id = ff.getProperties().equipmentId as number;
          const feature = source.getFeatureById(id);
          if (feature) {
            const fault: EquipmentFault = {
              faultId: ff.getId() as number,
              faultType: ff.getProperties().type,
              faultTypeCode: ff.getProperties().typeCode,
              recordTime: ff.getProperties().recordTime,
            };
            if (!faultMap.has(id)) {
              faultMap.set(id, []);
            }
            faultMap.get(id)?.push(fault);
          }
        }
        faultMap.forEach((faults, equipmentId) => {
          const feature = source.getFeatureById(equipmentId);
          if (feature) {
            faults.sort((a, b) => b.recordTime - a.recordTime);
            feature.set('faults', faults, true);
          }
        });
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [eQuery.data, fQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

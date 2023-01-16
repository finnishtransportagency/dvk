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

function useDataLayer(featureDataId: FeatureDataId, featureLayerId: FeatureDataLayerId, dataProjection = 'EPSG:4326') {
  const [ready, setReady] = useState(false);
  const { data } = useFeatureData(featureDataId);
  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource(featureLayerId);
      features.forEach((f) => f.set('dataSource', featureLayerId, true));
      source.addFeatures(features);
      setReady(true);
    }
  }, [featureLayerId, data, dataProjection]);
  return ready;
}

export function useLine12Layer() {
  return useDataLayer('line12', 'line12');
}

export function useLine3456Layer() {
  return useDataLayer('line3456', 'line3456');
}

export function useSeaNameLayer() {
  return useDataLayer('seaname', 'seaname');
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

  useEffect(() => {
    const aData = aQuery.data;
    const raData = raQuery.data;
    if (aData && raData) {
      const format = new GeoJSON();
      const afs = format.readFeatures(aData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const rafs = format.readFeatures(raData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      addSpeedLimits(afs, rafs);
      afs.forEach((f) => f.set('dataSource', 'area12', true));
      const source = dvkMap.getVectorSource('area12');
      source.addFeatures(afs);
      setReady(true);
    }
  }, [aQuery.data, raQuery.data]);
  return ready;
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
      const intersection = turf.intersect(raGeomPoly as turf.Polygon, aGeomPoly as turf.Polygon);
      if (intersection) {
        const feat = format.readFeature(intersection.geometry, {
          dataProjection: 'EPSG:4326',
          featureProjection: MAP.EPSG,
        });
        feat.setProperties({ speedLimit: speedLimit });
        speedLimitFeatures.push(feat);
      }
    }
  }
  return speedLimitFeatures;
}

export function useSpeedLimitLayer() {
  const [ready, setReady] = useState(false);
  const aQuery = useFeatureData('area12');
  const raQuery = useFeatureData('restrictionarea');

  useEffect(() => {
    const aData = aQuery.data;
    const raData = raQuery.data;
    if (aData && raData) {
      const format = new GeoJSON();
      const afs = format.readFeatures(aData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const rafs = format.readFeatures(raData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });

      const speedLimitFeatures = getSpeedLimitFeatures(rafs, afs);
      const source = dvkMap.getVectorSource('speedlimit');
      source.addFeatures(speedLimitFeatures);
      setReady(true);
    }
  }, [aQuery.data, raQuery.data]);
  return ready;
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
  useEffect(() => {
    const eData = eQuery.data;
    const fData = fQuery.data;
    if (eData && fData) {
      const format = new GeoJSON();
      const efs = format.readFeatures(eData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const ffs = format.readFeatures(fData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('safetyequipment');
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
      setReady(true);
    }
  }, [eQuery.data, fQuery.data]);
  return ready;
}

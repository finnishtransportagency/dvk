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
import VectorSource from 'ol/source/Vector';
import Layer from 'ol/layer/Layer';
import { getSpeedLimitFeatures } from '../speedlimitworker/SpeedlimitUtils';

export type DvkLayerState = {
  ready: boolean;
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  isPaused: boolean;
  isError: boolean;
};

function useDataLayer(
  featureDataId: FeatureDataId,
  featureLayerId: FeatureDataLayerId,
  dataProjection = 'EPSG:4326',
  refetchOnMount: 'always' | boolean = true,
  refetchInterval: number | false = false
): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useFeatureData(featureDataId, refetchOnMount, refetchInterval);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource(featureLayerId);
        source.clear();
        features.forEach((f) => f.set('dataSource', featureLayerId, true));
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [featureLayerId, data, dataUpdatedAt, dataProjection]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useLine12Layer() {
  return useDataLayer('line12', 'line12');
}

export function useLine3456Layer() {
  return useDataLayer('line3456', 'line3456', 'EPSG:4326', true, 1000 * 60 * 60 * 6);
}

export function useNameLayer() {
  return useDataLayer('name', 'name', MAP.EPSG);
}

export function useBackgroundFinlandLayer(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const fiQuery = useFeatureData('finland', true, false);
  const dataUpdatedAt = Math.max(fiQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(fiQuery.errorUpdatedAt);
  const isPaused = fiQuery.isPaused;
  const isError = fiQuery.isError;

  useEffect(() => {
    if (fiQuery.data) {
      const layer = dvkMap.getBackgroundLayer('finland') as Layer;
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const source = layer.getSource() as VectorSource;
        source.clear();
        const features = format.readFeatures(fiQuery.data, { dataProjection: MAP.EPSG, featureProjection: MAP.EPSG });
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [fiQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useBackgroundMmlmeriLayer(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const mmlmeriQuery = useFeatureData('mml_meri', true, false);
  const dataUpdatedAt = Math.max(mmlmeriQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(mmlmeriQuery.errorUpdatedAt);
  const isPaused = mmlmeriQuery.isPaused;
  const isError = mmlmeriQuery.isError;

  useEffect(() => {
    if (mmlmeriQuery.data) {
      const layer = dvkMap.getBackgroundLayer('mml-meri') as Layer;
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(mmlmeriQuery.data, { dataProjection: MAP.EPSG, featureProjection: MAP.EPSG });
        const source = layer.getSource() as VectorSource;
        source.clear();
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [mmlmeriQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useBackgroundMmljarviLayer(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const mmljarviQuery = useFeatureData('mml_jarvi', true, false);
  const dataUpdatedAt = Math.max(mmljarviQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(mmljarviQuery.errorUpdatedAt);
  const isPaused = mmljarviQuery.isPaused;
  const isError = mmljarviQuery.isError;

  useEffect(() => {
    if (mmljarviQuery.data) {
      const layer = dvkMap.getBackgroundLayer('mml-jarvi') as Layer;
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(mmljarviQuery.data, { dataProjection: MAP.EPSG, featureProjection: MAP.EPSG });
        const source = layer.getSource() as VectorSource;
        source.clear();
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [mmljarviQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useBackgroundMmllaituritLayer(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const mmllaituritQuery = useFeatureData('mml_laiturit', true, false);
  const dataUpdatedAt = Math.max(mmllaituritQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(mmllaituritQuery.errorUpdatedAt);
  const isPaused = mmllaituritQuery.isPaused;
  const isError = mmllaituritQuery.isError;

  useEffect(() => {
    if (mmllaituritQuery.data) {
      const layer = dvkMap.getBackgroundLayer('mml-laiturit') as Layer;
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(mmllaituritQuery.data, { dataProjection: MAP.EPSG, featureProjection: MAP.EPSG });
        const source = layer.getSource() as VectorSource;
        source.clear();
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [mmllaituritQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useBackgroundBalticseaLayer(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const baQuery = useFeatureData('balticsea', true, false);
  const dataUpdatedAt = Math.max(baQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(baQuery.errorUpdatedAt);
  const isPaused = baQuery.isPaused;
  const isError = baQuery.isError;

  useEffect(() => {
    if (baQuery.data) {
      const layer = dvkMap.getBackgroundLayer('balticsea') as Layer;
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(baQuery.data, { dataProjection: MAP.EPSG, featureProjection: MAP.EPSG });
        const source = layer.getSource() as VectorSource;
        source.clear();
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [baQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useBoardLine12Layer() {
  return useDataLayer('boardline12', 'boardline12');
}

export function useMareographLayer() {
  return useDataLayer('mareograph', 'mareograph', 'EPSG:4258', 'always', 1000 * 60 * 5);
}

export function useObservationLayer() {
  return useDataLayer('observation', 'observation', 'EPSG:4258', 'always', 1000 * 60 * 10);
}

export function useBuoyLayer() {
  return useDataLayer('buoy', 'buoy', 'EPSG:4258', 'always', 1000 * 60 * 30);
}

export function useVtsLineLayer() {
  return useDataLayer('vtsline', 'vtsline', 'EPSG:4258');
}

export function useVtsPointLayer() {
  return useDataLayer('vtspoint', 'vtspoint', 'EPSG:4258');
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
    const raGeomPoly = format.writeGeometryObject(raf.getGeometry() as Geometry);

    for (const faf of fafs) {
      const fafExtent = faf.getGeometry()?.getExtent();
      // No need to analyze more if bounding boxes do not intersect
      if (!rafExtent || !fafExtent || !intersects(rafExtent, fafExtent)) {
        continue;
      }

      const aGeomPoly = format.writeGeometryObject(faf.getGeometry() as Geometry);
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

export function useArea12Layer(): DvkLayerState {
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
  return useDataLayer('area3456', 'area3456', 'EPSG:4326', true, 1000 * 60 * 60 * 6);
}

export function useDepth12Layer() {
  return useDataLayer('depth12', 'depth12');
}

export function useSpeedLimitLayer(): DvkLayerState {
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
      const format = new GeoJSON();
      const layer = dvkMap.getFeatureLayer('speedlimit');
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        layer.set('dataUpdatedAt', dataUpdatedAt);
        if (window.Worker) {
          const slWorker: Worker = new Worker(new URL('../speedlimitworker/SpeedlimitWorker.ts', import.meta.url));
          slWorker.onmessage = (e) => {
            const features = format.readFeatures(e.data as string);
            const source = dvkMap.getVectorSource('speedlimit');
            source.clear();
            source.addFeatures(features);
          };
          slWorker.postMessage({ raData: JSON.stringify(raData), aData: JSON.stringify(aData) });
        } else {
          const afs = format.readFeatures(aData);
          const rafs = format.readFeatures(raData);
          const speedLimitFeatures = getSpeedLimitFeatures(rafs, afs);
          const source = dvkMap.getVectorSource('speedlimit');
          source.clear();
          source.addFeatures(speedLimitFeatures);
        }
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
  return useDataLayer('pilot', 'pilot', 'EPSG:4258');
}

export function useHarborLayer() {
  return useDataLayer('harbor', 'harbor');
}

export function useMarineWarningLayer() {
  return useDataLayer('marinewarning', 'marinewarning', 'EPSG:3395', 'always', 1000 * 60 * 15);
}

export type EquipmentFault = {
  faultId: number;
  faultType: Text;
  faultTypeCode: string;
  recordTime: number;
};

export function useSafetyEquipmentLayer(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const eQuery = useFeatureData('safetyequipment');
  const fQuery = useFeatureData('safetyequipmentfault', true, 1000 * 60 * 15);
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
        efs.forEach((f) => {
          f.set('dataSource', 'safetyequipment', true);
        });
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

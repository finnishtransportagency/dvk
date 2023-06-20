import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import * as turf from '@turf/turf';
import { BackgroundLayerId, FeatureDataId, FeatureDataLayerId, FeatureDataSources, MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { intersects } from 'ol/extent';
import { useFeatureData } from '../utils/dataLoader';
import { useEffect, useState } from 'react';
import { Text } from '../graphql/generated';
import VectorSource from 'ol/source/Vector';
import { getSpeedLimitFeatures } from '../speedlimitworker/SpeedlimitUtils';
import axios from 'axios';

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

export function useCircleLayer() {
  return useDataLayer('circle', 'circle');
}

export function useStaticDataLayer(featureLayerId: FeatureDataLayerId | BackgroundLayerId) {
  const [ready, setReady] = useState(false);
  const [dataUpdatedAt, setDataUpdatedAt] = useState(0);
  const isPaused = false;
  const errorUpdatedAt = 0;
  const isError = false;

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(featureLayerId);
    let layerStatus = layer.get('status');
    console.log('---- CHECK LAYER ' + featureLayerId + ': ' + layerStatus);
    if (layerStatus === 'ready') {
      setDataUpdatedAt(layer.get('dataUpdatedAt'));
      setReady(true);
    } else {
      const fp = () => {
        layerStatus = layer.get('status');
        console.log('---- LAYER STATUS ' + featureLayerId + ': ' + layerStatus);
        if (layerStatus === 'ready') {
          setDataUpdatedAt(layer.get('dataUpdatedAt'));
          setReady(true);
          layer.un('propertychange', fp);
        }
      };
      console.log('---- LISTEN LAYER CHANGE: ' + featureLayerId);
      layer.on('propertychange', fp);
    }
  }, [featureLayerId]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useInitStaticDataLayer(
  featureDataId: FeatureDataId,
  featureLayerId: FeatureDataLayerId | BackgroundLayerId,
  dataProjection = MAP.EPSG
): DvkLayerState {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  let urlStr: string;
  if (process.env.REACT_APP_USE_STATIC_FEATURES === 'true') {
    urlStr = fds?.staticUrl ? fds.staticUrl.toString() : fds?.url.toString() || '';
  } else {
    urlStr = fds?.url ? fds.url.toString() : '';
  }

  const [isError, setIsError] = useState(false);
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number>(0);
  const [errorUpdatedAt, setErrorUpdatedAt] = useState<number>(0);
  const isPaused = false;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(featureLayerId);
    const status = layer.get('status');
    if (status !== 'ready' && status !== 'loading') {
      layer.set('status', 'loading');
      (async () => {
        try {
          const response = await axios.get(urlStr);
          const format = new GeoJSON();
          const source = layer.getSource() as VectorSource;
          source.clear();
          const features = format.readFeatures(response.data, { dataProjection, featureProjection: MAP.EPSG });
          source.addFeatures(features);
          setDataUpdatedAt(Date.now());
          layer.set('dataUpdatedAt', dataUpdatedAt);
          layer.set('status', 'ready');
          setReady(true);
        } catch (e) {
          setIsError(true);
          setErrorUpdatedAt(Date.now());
        }
      })();
    }
  }, [urlStr, dataProjection, featureLayerId, dataUpdatedAt]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useNameLayer() {
  return useStaticDataLayer('name');
}

export function useBackgroundFinlandLayer(): DvkLayerState {
  return useStaticDataLayer('finland');
}

export function useBackgroundMmlmeriLayer(): DvkLayerState {
  return useStaticDataLayer('mml_meri');
}

export function useBackgroundMmljarviLayer(): DvkLayerState {
  return useStaticDataLayer('mml_jarvi');
}

export function useBackgroundMmllaituritLayer(): DvkLayerState {
  return useStaticDataLayer('mml_laiturit');
}

export function useBackgroundBalticseaLayer(): DvkLayerState {
  return useStaticDataLayer('balticsea');
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

export function useSpecialArea2Layer() {
  return useDataLayer('specialarea2', 'specialarea2');
}

export function useSpecialArea15Layer() {
  return useDataLayer('specialarea15', 'specialarea15');
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

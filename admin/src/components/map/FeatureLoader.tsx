import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import booleanDisjoint from '@turf/boolean-disjoint';
import { Polygon as turf_Polygon } from 'geojson';
import { BackgroundLayerId, FeatureDataId, FeatureDataLayerId, MAP } from '../../utils/constants';
import dvkMap from './DvkMap';
import { intersects } from 'ol/extent';
import { useFeatureData, useStaticFeatureData } from '../../utils/dataLoader';
import { useEffect, useState } from 'react';
import VectorSource from 'ol/source/Vector';
import { getSpeedLimitFeatures } from '../../speedlimitworker/SpeedlimitUtils';
import { getFairwayAreaBorderFeatures } from '../../fairwayareaworker/FairwayAreaUtils';
import { getFeatureDataSourceProjection } from '../../utils/common';

export type DvkLayerState = {
  ready: boolean;
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  isPaused: boolean;
  isError: boolean;
};

function useDataLayer(featureDataId: FeatureDataId, featureLayerId: FeatureDataLayerId): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useFeatureData(featureDataId);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, { dataProjection: getFeatureDataSourceProjection(featureDataId), featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource(featureLayerId);
        source.clear();
        features.forEach((f) => f.set('dataSource', featureLayerId, true));
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [featureDataId, featureLayerId, data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useLine12Layer() {
  return useDataLayer('line12', 'line12');
}

export function useLine3456Layer() {
  return useDataLayer('line3456', 'line3456');
}

export function useCircleLayer() {
  return useDataLayer('circle', 'circle');
}

function useStaticDataLayer(
  featureDataId: FeatureDataId,
  featureLayerId: FeatureDataLayerId | BackgroundLayerId,
  dataProjection = MAP.EPSG,
  refetchOnMount: 'always' | boolean = false,
  refetchInterval: number | false = false
): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useStaticFeatureData(featureDataId, refetchOnMount, refetchInterval);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON({ featureClass: Feature });
        const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG }) as unknown as Feature<Geometry>[];
        layer.setSource(
          new VectorSource<Feature<Geometry>>({
            features: features,
            overlaps: false,
          })
        );
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [featureLayerId, data, dataUpdatedAt, dataProjection]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useNameLayer() {
  return useDataLayer('name', 'name');
}

export function useBackgroundFinlandLayer(): DvkLayerState {
  return useStaticDataLayer('finland', 'finland');
}

export function useBackgroundBalticseaLayer(): DvkLayerState {
  return useStaticDataLayer('balticsea', 'balticsea');
}

export function useBackgroundMmlSatamatLayer(): DvkLayerState {
  return useStaticDataLayer('mml_satamat', 'mml_satamat');
}

export function useBoardLine12Layer() {
  return useDataLayer('boardline12', 'boardline12');
}

export function useVtsLineLayer() {
  return useDataLayer('vtsline', 'vtsline');
}

export function useVtsPointLayer() {
  return useDataLayer('vtspoint', 'vtspoint');
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
      if (!booleanDisjoint(raGeomPoly as turf_Polygon, aGeomPoly as turf_Polygon)) {
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
        const afs = format.readFeatures(aData, { dataProjection: getFeatureDataSourceProjection('area12'), featureProjection: MAP.EPSG });
        const rafs = format.readFeatures(raData, { dataProjection: getFeatureDataSourceProjection('restrictionarea'), featureProjection: MAP.EPSG });
        addSpeedLimits(afs, rafs);
        afs.forEach((f) => f.set('dataSource', 'area12', true));
        const source = dvkMap.getVectorSource('area12');
        source.clear();
        source.addFeatures(afs);
        layer.set('dataUpdatedAt', dataUpdatedAt);
        if (window.Worker) {
          const faWorker: Worker = new Worker(new URL('../../fairwayareaworker/FairwayAreaWorker.ts', import.meta.url), { type: 'module' });
          faWorker.onmessage = (e) => {
            const borderlineFeatures = format.readFeatures(e.data as string);
            borderlineFeatures.forEach((f) => f.set('dataSource', 'area12Borderline', true));
            source.addFeatures(borderlineFeatures);
          };
          faWorker.postMessage({ faData: JSON.stringify(aData) });
        } else {
          const borderlineFeatures = getFairwayAreaBorderFeatures(afs);
          borderlineFeatures.forEach((f) => f.set('dataSource', 'area12Borderline', true));
          source.addFeatures(borderlineFeatures);
        }
      }
      setReady(true);
    }
  }, [aQuery.data, raQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useArea3456Layer() {
  const [ready, setReady] = useState(false);
  const aQuery = useFeatureData('area3456', true, 1000 * 60 * 60 * 6);
  const dataUpdatedAt = aQuery.dataUpdatedAt;
  const errorUpdatedAt = aQuery.errorUpdatedAt;
  const isPaused = aQuery.isPaused;
  const isError = aQuery.isError;

  useEffect(() => {
    const aData = aQuery.data;
    if (aData) {
      const layer = dvkMap.getFeatureLayer('area3456');
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const afs = format.readFeatures(aData, { dataProjection: getFeatureDataSourceProjection('area3456'), featureProjection: MAP.EPSG });
        afs.forEach((f) => f.set('dataSource', 'area3456', true));
        const source = dvkMap.getVectorSource('area3456');
        source.clear();
        source.addFeatures(afs);
        layer.set('dataUpdatedAt', dataUpdatedAt);
        if (window.Worker) {
          const faWorker: Worker = new Worker(new URL('../../fairwayareaworker/FairwayAreaWorker.ts', import.meta.url), { type: 'module' });
          faWorker.onmessage = (e) => {
            const borderlineFeatures = format.readFeatures(e.data as string);
            borderlineFeatures.forEach((f) => f.set('dataSource', 'area3456Borderline', true));
            source.addFeatures(borderlineFeatures);
          };
          faWorker.postMessage({ faData: JSON.stringify(aData) });
        } else {
          const borderlineFeatures = getFairwayAreaBorderFeatures(afs);
          borderlineFeatures.forEach((f) => f.set('dataSource', 'area3456Borderline', true));
          source.addFeatures(borderlineFeatures);
        }
      }
      setReady(true);
    }
  }, [aQuery.data, dataUpdatedAt]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
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
          const slWorker: Worker = new Worker(new URL('../../speedlimitworker/SpeedlimitWorker.ts', import.meta.url), { type: 'module' });
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
  return useDataLayer('pilot', 'pilot');
}

export function useHarborLayer() {
  return useDataLayer('harbor', 'harbor');
}

export function useSafetyEquipmentLayer(): DvkLayerState {
  return useDataLayer('safetyequipment', 'safetyequipment');
}

export function usePilotageAreaBorderLayer() {
  return useDataLayer('pilotageareaborder', 'pilotageareaborder');
}

export function usePilotageLimitLayer() {
  return useDataLayer('pilotagelimit', 'pilotagelimit');
}

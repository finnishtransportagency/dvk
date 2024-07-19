import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { booleanDisjoint as turf_booleanDisjoint } from '@turf/boolean-disjoint';
import { Polygon as turf_Polygon } from 'geojson';
import {
  BackgroundLayerId,
  FeatureDataId,
  FeatureDataLayerId,
  StaticFeatureDataSources,
  MAP,
  StaticFeatureDataId,
  FeatureLayerId,
} from '../utils/constants';
import dvkMap from './DvkMap';
import { intersects } from 'ol/extent';
import { useFeatureData } from '../utils/dataLoader';
import { useEffect, useState } from 'react';
import VectorSource from 'ol/source/Vector';
import { getSpeedLimitFeatures } from '../speedlimitworker/SpeedlimitUtils';
import axios from 'axios';
import { get, setMany, delMany } from 'idb-keyval';
import { filterMarineWarnings } from '../utils/common';
import { getFairwayAreaBorderFeatures } from '../fairwayareaworker/FairwayAreaUtils';
import RenderFeature from 'ol/render/Feature';

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
  refetchInterval: number | false = false,
  enabled: boolean = true,
  filterMethod?: (features: Feature<Geometry>[]) => Feature<Geometry>[]
): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useFeatureData(featureDataId, refetchOnMount, refetchInterval, enabled);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (!layer.get('dataUpdatedAt') || dataUpdatedAt > layer.get('dataUpdatedAt')) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource(featureLayerId);
        source.clear();
        features.forEach((f) => f.set('dataSource', featureLayerId, true));
        source.addFeatures(filterMethod !== undefined ? filterMethod(features) : features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [featureLayerId, data, dataUpdatedAt, dataProjection, filterMethod]);
  const layer = dvkMap.getFeatureLayer(featureLayerId);
  layer.set('errorUpdatedAt', errorUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useConditionsDataLayer(
  featureDataId: FeatureDataId,
  featureLayerId: FeatureDataLayerId,
  dataProjection = 'EPSG:4326',
  refetchOnMount: 'always' | boolean = true,
  refetchInterval: number | false = false,
  enabled: boolean = true
): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useFeatureData(featureDataId, refetchOnMount, refetchInterval, enabled);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource(featureLayerId);

        features.forEach((f) => {
          const id = f.getId();
          const sourceFeat = id ? source.getFeatureById(id) : null;
          if (sourceFeat) {
            sourceFeat.setProperties(f.getProperties());
          } else {
            f.set('dataSource', featureLayerId, true);
            source.addFeature(f);
          }
        });
        const featureIds = features.map((f) => f.getId());
        const featuresToRemove = source.getFeatures().filter((f) => !featureIds.includes(f.getId()));
        source.removeFeatures(featuresToRemove);

        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [featureLayerId, data, dataUpdatedAt, dataProjection]);
  const layer = dvkMap.getFeatureLayer(featureLayerId);
  layer.set('errorUpdatedAt', errorUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

// check if feature is visible on it's own layer or selected fairway card layer
export function featuresVisible(featureLayer: FeatureLayerId): boolean {
  const oLayer = dvkMap.getFeatureLayer(featureLayer);
  const sfcLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
  return oLayer.isVisible() || sfcLayer.isVisible();
}

export function useNameLayer() {
  return useDataLayer('name', 'name', MAP.EPSG);
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

export function useStaticDataLayer(featureLayerId: BackgroundLayerId) {
  const [ready, setReady] = useState(false);
  const [dataUpdatedAt, setDataUpdatedAt] = useState(0);
  const isPaused = false;
  const errorUpdatedAt = 0;
  const isError = false;

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(featureLayerId);
    let layerStatus = layer.get('status');
    if (layerStatus === 'ready') {
      setDataUpdatedAt(layer.get('dataUpdatedAt'));
      setReady(true);
    } else {
      const fp = () => {
        layerStatus = layer.get('status');
        if (layerStatus === 'ready') {
          setDataUpdatedAt(layer.get('dataUpdatedAt'));
          setReady(true);
          layer.un('propertychange', fp);
        }
      };
      layer.on('propertychange', fp);
    }
  }, [featureLayerId]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

function useStaticFeatureDataCacheBusting(featureDataId: StaticFeatureDataId, busterKey: string, busterValue: string) {
  const [status, setStatus] = useState<'notStarted' | 'inProgress' | 'done'>('notStarted');

  useEffect(() => {
    if (status === 'notStarted') {
      setStatus('inProgress');
      (async () => {
        get(busterKey).then(async (data) => {
          if (data === busterValue) {
            setStatus('done');
          } else {
            delMany([featureDataId, busterKey]).then(() => {
              setStatus('done');
            });
          }
        });
      })();
    }
  }, [featureDataId, busterKey, busterValue, status]);

  return status;
}

export function useInitStaticDataLayer(
  featureDataId: StaticFeatureDataId,
  featureLayerId: BackgroundLayerId,
  dataProjection = MAP.EPSG
): DvkLayerState {
  const fds = StaticFeatureDataSources.find((fda) => fda.id === featureDataId);
  const urlStr: string = fds?.url ? fds.url.toString() : '';

  const [isError, setIsError] = useState(false);
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number>(0);
  const [errorUpdatedAt, setErrorUpdatedAt] = useState<number>(0);
  const isPaused = false;
  const [ready, setReady] = useState(false);
  const busterKey = featureDataId + '-buster';
  const cacheBustingStatus = useStaticFeatureDataCacheBusting(featureDataId, busterKey, urlStr);

  useEffect(() => {
    const initLayer = (data: unknown) => {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      const format = new GeoJSON({ featureClass: RenderFeature });
      const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG }) as unknown as Feature<Geometry>[];
      layer.setSource(
        new VectorSource<Feature<Geometry>>({
          features: features,
          overlaps: false,
        })
      );
      setDataUpdatedAt(Date.now());
      layer.set('dataUpdatedAt', Date.now(), true);
      layer.set('status', 'ready', true);
      setReady(true);
    };

    if (cacheBustingStatus === 'done') {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (!['ready', 'loading'].includes(layer.get('status'))) {
        layer.set('status', 'loading');
        (async () => {
          get(featureDataId).then(async (data) => {
            if (data) {
              initLayer(data);
            } else {
              await axios
                .get(urlStr)
                .then((response) => {
                  data = response.data;
                  setMany([
                    [featureDataId, response.data],
                    [busterKey, urlStr],
                  ]).catch((err) => console.warn('Caching ' + featureLayerId + 'failed: ' + err));
                  initLayer(data);
                })
                .catch(() => {
                  setIsError(true);
                  setErrorUpdatedAt(Date.now());
                });
            }
          });
        })();
      }
    }
  }, [cacheBustingStatus, urlStr, dataProjection, featureLayerId, featureDataId, busterKey]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useBoardLine12Layer() {
  return useDataLayer('boardline12', 'boardline12');
}

export function useBuoyLayer() {
  const [initialized, setInitialized] = useState(false);
  const [visible, setVisible] = useState(false);
  if (!initialized) {
    const layer = dvkMap.getFeatureLayer('buoy');
    setVisible(layer.isVisible());
    layer.on('change:visible', () => {
      setVisible(layer.isVisible());
    });
    setInitialized(true);
  }
  return useDataLayer('buoy', 'buoy', 'EPSG:4258', 'always', 1000 * 60 * 30, visible);
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
      if (!turf_booleanDisjoint(raGeomPoly as turf_Polygon, aGeomPoly as turf_Polygon)) {
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
        if (window.Worker) {
          const faWorker: Worker = new Worker(new URL('../fairwayareaworker/FairwayAreaWorker.ts', import.meta.url), { type: 'module' });
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
        const afs = format.readFeatures(aData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        afs.forEach((f) => f.set('dataSource', 'area3456', true));
        const source = dvkMap.getVectorSource('area3456');
        source.clear();
        source.addFeatures(afs);
        layer.set('dataUpdatedAt', dataUpdatedAt);
        if (window.Worker) {
          const faWorker: Worker = new Worker(new URL('../fairwayareaworker/FairwayAreaWorker.ts', import.meta.url), { type: 'module' });
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
          const slWorker: Worker = new Worker(new URL('../speedlimitworker/SpeedlimitWorker.ts', import.meta.url), { type: 'module' });
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

export function useCoastalWarningLayer() {
  return useDataLayer('marinewarning', 'coastalwarning', 'EPSG:3395', 'always', 1000 * 60 * 15, true, filterMarineWarnings('coastalwarning'));
}

export function useLocalWarningLayer() {
  return useDataLayer('marinewarning', 'localwarning', 'EPSG:3395', 'always', 1000 * 60 * 15, true, filterMarineWarnings('localwarning'));
}

export function useBoaterWarningLayer() {
  return useDataLayer('marinewarning', 'boaterwarning', 'EPSG:3395', 'always', 1000 * 60 * 15, true, filterMarineWarnings('boaterwarning'));
}

export function useVaylaWaterAreaData() {
  return useFeatureData('vayla_water_area');
}

export function usePilotageAreaBorderLayer() {
  return useDataLayer('pilotageareaborder', 'pilotageareaborder', 'EPSG:3067');
}

export function useDirwayLayer() {
  return useDataLayer('dirway', 'dirway');
}

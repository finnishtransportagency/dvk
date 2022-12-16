import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import * as turf from '@turf/turf';
import { MAP, FeatureLayerId, FeatureDataLayerId } from '../utils/constants';
import dvkMap from './DvkMap';
import { intersects } from 'ol/extent';

async function makeRequest(url: URL, id: FeatureLayerId): Promise<Feature<Geometry>[]> {
  return new Promise<Feature<Geometry>[]>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const format = new GeoJSON();
        const features = format.readFeatures(xhr.responseText, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        console.log(id + ' succesfully loaded features: ' + features.length);
        resolve(features);
      } else {
        reject(id + ' FAILED');
      }
    };
    xhr.onerror = () => {
      reject(id + ' ONERROR');
    };
    xhr.send();
  });
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
      // Check if fairway area polygone is inside restriction area polygone
      if (turf.booleanContains(raGeomPoly as turf.Polygon, aGeomPoly as turf.Polygon)) {
        faf.setProperties({ speedLimit: speedLimit });
        speedLimitFeatures.push(faf);
      } else {
        // Find intersection of fairway area and restriction area polygons
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
  }
  return speedLimitFeatures;
}

let featuresInitialized = false;

async function InitFeatures() {
  const featurePromises: { layerId: FeatureDataLayerId; promise: Promise<Feature<Geometry>[]> }[] = [];
  const layerFeatures: { layerId: FeatureDataLayerId; features: Feature<Geometry>[] }[] = [];
  if (!featuresInitialized) {
    try {
      MAP.FEATURE_DATA_LAYERS.forEach((layer) => {
        featurePromises.push({ layerId: layer.id, promise: makeRequest(layer.url, layer.id) });
      });

      for (const fp of featurePromises) {
        const features = await fp.promise;
        layerFeatures.push({ layerId: fp.layerId, features: features });

        if (fp.layerId !== 'restrictionarea') {
          const source = dvkMap.getVectorSource(fp.layerId);
          features.forEach((f) => f.set('dataSource', fp.layerId, true));
          source.addFeatures(features);
        }
      }

      const ralf = layerFeatures.find((lf) => lf.layerId === 'restrictionarea');
      const alf = layerFeatures.find((lf) => lf.layerId === 'area12');

      if (ralf && alf) {
        const speedLimitFeatures = getSpeedLimitFeatures(ralf.features, alf.features);
        const source = dvkMap.getVectorSource('speedlimit');
        source.addFeatures(speedLimitFeatures);
      }
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }

    featuresInitialized = true;
    return Promise.resolve();
  } else {
    return Promise.resolve();
  }
}

export { InitFeatures };

import { GeoJSON } from 'ol/format';
import { MAP, FeatureLayerId } from '../utils/constants';
import dvkMap from './DvkMap';

async function makeRequest(url: URL, id: FeatureLayerId): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const format = new GeoJSON();
        const features = format.readFeatures(xhr.responseText, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        console.log(id + ' succesfully loaded features: ' + features.length);
        const source = dvkMap.getVectorSource(id);
        source.addFeatures(features);
        resolve(xhr);
      } else {
        reject(id + ' FAILED');
      }
    };
    xhr.onerror = () => {
      reject(id + ' ONERROR');
    };
    xhr.send();
  }).catch((error) => console.error(error));
}

let featuresInitialized = false;

function InitFeatures() {
  if (!featuresInitialized) {
    const responses: Promise<unknown>[] = [];
    MAP.FEATURE_DATA_LAYERS.forEach((layer) => {
      if (layer.url) {
        responses.push(makeRequest(layer.url, layer.id));
      }
    });
    Promise.all(responses).then(() => {
      MAP.FEATURE_DATA_LAYERS.forEach((layer) => {
        if (layer.ids) {
          for (const id of layer.ids) {
            dvkMap.getVectorSource(layer.id).addFeatures(dvkMap.getVectorSource(id).getFeatures());
          }
        }
      });
    });
    featuresInitialized = true;
  }
}

export { InitFeatures };

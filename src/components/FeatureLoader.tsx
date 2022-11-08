import { GeoJSON } from 'ol/format';
import { MAP, FeatureLayerIdType } from '../utils/constants';
import dvkMap from './DvkMap';

async function makeRequest(url: URL, id: FeatureLayerIdType) {
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
        console.log(id + ' FAILED');
        reject();
      }
    };
    xhr.onerror = () => {
      console.log(id + ' ONERROR');
      reject();
    };
    xhr.send();
  });
}

function InitFeatures() {
  MAP.FEATURE_LAYERS.forEach((layer) => {
    makeRequest(layer.url, layer.id);
  });
}

export { InitFeatures };

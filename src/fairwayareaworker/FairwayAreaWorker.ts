import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { getFairwayAreaBorderFeatures } from './FairwayAreaUtils';

function initOLProj4() {
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
  proj4.defs(MAP.EPSG, '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
  register(proj4);
}

onmessage = (e: MessageEvent<{ faData: string }>) => {
  initOLProj4();
  const faData = JSON.parse(e.data.faData);
  const format = new GeoJSON();
  const borderLineFeatures = getFairwayAreaBorderFeatures(format.readFeatures(faData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG }));
  postMessage(format.writeFeatures(borderLineFeatures));
};

export {};

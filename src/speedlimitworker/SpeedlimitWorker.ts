import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { getSpeedLimitFeatures } from './SpeedlimitUtils';

function initOLProj4() {
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
  proj4.defs(MAP.EPSG, '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
  register(proj4);
}

onmessage = (e: MessageEvent<{ raData: string; aData: string }>) => {
  initOLProj4();
  const raData = JSON.parse(e.data.raData);
  const aData = JSON.parse(e.data.aData);
  const format = new GeoJSON();
  const speedLimitFeatures = getSpeedLimitFeatures(format.readFeatures(raData), format.readFeatures(aData));
  postMessage(format.writeFeatures(speedLimitFeatures));
};

export {};

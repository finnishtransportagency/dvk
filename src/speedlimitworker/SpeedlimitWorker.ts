import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { getSpeedLimitFeatures } from './SpeedlimitUtils';

function initOLProj4() {
  proj4.defs('EPSG:4258', '+proj=longlat +ellps=GRS80 +no_defs +type=crs');
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
  proj4.defs('EPSG:3395', '+proj=merc +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs');
  proj4.defs(MAP.EPSG, '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
  register(proj4);
}

onmessage = (e: MessageEvent<{ raData: string; aData: string }>) => {
  initOLProj4();
  const data = e.data;
  const raData = JSON.parse(data.raData);
  const aData = JSON.parse(data.aData);
  const format = new GeoJSON();
  const afs = format.readFeatures(aData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
  const rafs = format.readFeatures(raData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
  const speedLimitFeatures = getSpeedLimitFeatures(rafs, afs);
  const slFeaturesString = format.writeFeatures(speedLimitFeatures, { dataProjection: MAP.EPSG, featureProjection: MAP.EPSG });
  postMessage(slFeaturesString);
};

export {};

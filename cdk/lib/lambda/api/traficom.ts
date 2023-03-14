import axios from 'axios';
import { FeatureCollection } from 'geojson';
import { getSOAApiUrl, getTraficomHeaders } from '../environment';
import { log } from '../logger';
import { roundGeometry } from '../util';

async function fetchApi<T>(path: string) {
  const url = `https://${await getSOAApiUrl()}/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getTraficomHeaders(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Traficom api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Weather api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Traficom api response time: ${duration} ms`);
  return response.data ? (response.data as T) : ({ type: 'FeatureCollection', features: [] } as FeatureCollection);
}

export async function fetchVTSPointsAndLines() {
  const data = await fetchApi<FeatureCollection>(
    'trafiaineistot/inspirepalvelu/avoin/wfs?request=getFeature&typename=avoin:Rdocal_L,avoin:Rdocal_P&outputFormat=application/json&srsName=urn:ogc:def:crs:EPSG::4258'
  );
  return data.features.filter((row) => {
    if ('coordinates' in row.geometry) {
      // to 2D
      if (row.geometry.type === 'Point' && row.geometry.coordinates.length === 3) {
        row.geometry.coordinates.pop();
      } else if (row.geometry.type === 'LineString') {
        for (const pos of row.geometry.coordinates) {
          if (pos.length === 3) {
            pos.pop();
          }
        }
      }
    }
    roundGeometry(row.geometry);
    return row.properties?.OBJNAM !== 'GOFREP' && row.properties?.OBJNAM !== 'Reporting wintertime 60N';
  });
}

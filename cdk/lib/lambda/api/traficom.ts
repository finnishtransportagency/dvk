import axios from 'axios';
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, Point } from 'geojson';
import { getSOAApiUrl, getTimeout, getTraficomHeaders } from '../environment';
import { log } from '../logger';
import { roundGeometry } from '../util';
import { PilotPlace } from '../../../graphql/generated';

async function fetchApi<T>(path: string) {
  const url = `https://${await getSOAApiUrl()}/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getTraficomHeaders(),
      timeout: getTimeout(),
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

function roundGeometryAnd2D(row: Feature<Geometry, GeoJsonProperties>) {
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
}

export async function fetchVTSPointsAndLines() {
  const data = await fetchApi<FeatureCollection>(
    'trafiaineistot/inspirepalvelu/avoin/wfs?request=getFeature&typename=avoin:Rdocal_L,avoin:Rdocal_P&outputFormat=application/json&srsName=urn:ogc:def:crs:EPSG::4258'
  );
  return data.features.filter((row) => {
    roundGeometryAnd2D(row);
    return row.properties?.OBJNAM !== 'GOFREP' && row.properties?.OBJNAM !== 'Reporting wintertime 60N';
  });
}

export async function fetchPilotPoints(): Promise<PilotPlace[]> {
  const data = (await fetchApi<FeatureCollection<Point>>(
    'trafiaineistot/inspirepalvelu/avoin/wfs?request=getFeature&typename=avoin:PilotBoardingPlace_P&srsName=urn:ogc:def:crs:EPSG::4258&outputFormat=application/json'
  )) as FeatureCollection<Point>;
  data.features.forEach((row) => {
    roundGeometryAnd2D(row);
  });
  return data.features.map((row) => {
    return {
      id: Number(row.properties?.IDENTIFIER.replaceAll(' ', '').substring(2)), // IDENTIFIER": "FI 0000359116 00403"
      name: {
        fi: row.properties?.OBJNAM,
        sv: row.properties?.OBJNAM,
        en: row.properties?.OBJNAM,
      },
      geometry: { type: row.geometry.type, coordinates: row.geometry.coordinates },
    };
  });
}

import { Feature, FeatureCollection, GeoJsonProperties, Geometry, Point } from 'geojson';
import { roundGeometry } from '../util';
import { PilotPlace } from '../../../graphql/generated';
import { fetchTraficomApi } from './axios';

function flattenCoordinates(row: Feature<Geometry, GeoJsonProperties>) {
  if ('coordinates' in row.geometry) {
    // From 3D to 2D - drop z coordinates
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
}

async function fetchVTSByType(type: string) {
  const data = await fetchTraficomApi<FeatureCollection>(
    `trafiaineistot/inspirepalvelu/avoin/wfs?request=getFeature&typename=${type}&outputFormat=application/json&srsName=urn:ogc:def:crs:EPSG::4258`
  );
  return data.features.filter((row) => {
    flattenCoordinates(row);
    roundGeometry(row.geometry);
    return row.properties?.OBJNAM !== 'GOFREP' && row.properties?.OBJNAM !== 'Reporting wintertime 60N';
  });
}

export async function fetchVTSPoints() {
  return fetchVTSByType('avoin:Rdocal_P');
}

export async function fetchVTSLines() {
  return fetchVTSByType('avoin:Rdocal_L');
}

export async function fetchPilotPoints(): Promise<PilotPlace[]> {
  const data = (await fetchTraficomApi<FeatureCollection<Point>>(
    'trafiaineistot/inspirepalvelu/avoin/wfs?request=getFeature&typename=avoin:PilotBoardingPlace_P&srsName=urn:ogc:def:crs:EPSG::4258&outputFormat=application/json'
  )) as FeatureCollection<Point>;
  data.features.forEach((row) => {
    flattenCoordinates(row);
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

export async function fetchProhibitionAreas(): Promise<Feature<Geometry, GeoJsonProperties>[]> {
  const path =
    'trafiaineistot/inspirepalvelu/avoin/wfs?request=GetFeature&service=WFS&version=1.1.0&outputFormat=application/json&typeName=avoin:kohtaamis_ja_ohittamiskieltoalueet';
  const data = await fetchTraficomApi<FeatureCollection>(path);
  return data.features.map((row) => {
    return {
      type: 'Feature',
      id: row.properties?.ALUENRO,
      geometry: row.geometry,
      properties: {
        featureType: 'specialarea15',
        typeCode: 15,
        type: row.properties?.RAJOITE_TYYPPI,
        vtsArea: row.properties?.VTS_ALUE,
        extraInfo: {
          fi: row.properties?.LISATIETO?.trim(),
          sv: row.properties?.LISATIETO_SV?.trim(),
        },
        fairway: {
          fairwayId: row.properties?.JNRO,
          name: {
            fi: row.properties?.VAYLA_NIMI,
            sv: row.properties?.VAYLA_NIMI_SV,
          },
        },
      },
    };
  });
}

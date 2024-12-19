import { Feature, FeatureCollection, GeoJsonProperties, Geometry, MultiPolygon, Point, Polygon } from 'geojson';
import { mapProhibitionAreaFeatures, roundGeometry } from '../util';
import { PilotPlace } from '../../../graphql/generated';
import { fetchTraficomApi } from './axios';
import { union as turf_union } from '@turf/union';
import * as turf_helpers from '@turf/helpers';

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
  return mapProhibitionAreaFeatures(data.features);
}

export async function fetchN2000MapAreas(): Promise<Polygon | MultiPolygon | undefined> {
  const path =
    'trafiaineistot/inspirepalvelu/avoin/wfs?request=getFeature&typename=avoin:tuotejako_kaikki&outputFormat=application/json&srsName=urn:ogc:def:crs:EPSG::4258&cql_filter=IS_N2000=1';
  let data = undefined;
  try {
    data = await fetchTraficomApi<FeatureCollection>(path);
  } catch (error) {
    return undefined;
  }
  const turfAreas: Feature<Polygon>[] = [];

  data.features.forEach((f) => {
    const feat = {
      type: 'Feature',
      geometry: f.geometry,
      properties: {},
    };
    turfAreas.push(feat as Feature<Polygon>);
  });

  if (turfAreas.length < 1) {
    return undefined;
  }
  const union = turf_union(turf_helpers.featureCollection(turfAreas));
  return union === null ? undefined : union?.geometry;
}

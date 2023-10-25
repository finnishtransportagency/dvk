import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { Vessel, VesselAPIModel, VesselLocationFeatureCollection } from './apiModels';
import { fetchAISFeatureCollection, fetchAISMetadata } from './axios';

const aisV1Path = 'ais/api/ais/v1/';

function getTimestampParams(): Record<string, string> {
  const now = Date.now();
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  return { from: yesterday.toString(), to: now.toString() };
}

function parseFrom64BitInteger(integer: number, bitStart: number, bitEnd: number) {
  // 64-bit integer: get bit range from start to end by losing other bits
  // Shift bits first to left and then to right, let others fall off
  const i = (integer << (63 - bitStart)) >>> (63 - bitStart + bitEnd);
  return i.toString().padStart(2, '0');
}

/* MMDDHHMM UTC
Bits 19-16: month; 1-12; 0 = not available = default
Bits 15-11: day; 1-31; 0 = not available = default
Bits 10-6: hour; 0-23; 24 = not available = default
Bits 5-0: minute; 0-59; 60 = not available = default
*/
function parseETA(eta: number): string {
  const month = parseFrom64BitInteger(eta, 19, 16);
  const day = parseFrom64BitInteger(eta, 15, 11);
  const hour = parseFrom64BitInteger(eta, 10, 6);
  const minute = parseFrom64BitInteger(eta, 5, 0);
  return month + '-' + day + ' ' + hour + ':' + minute;
}

export async function fetchVessels(): Promise<Vessel[]> {
  const path = aisV1Path + 'vessels';
  const params = getTimestampParams();
  const data: VesselAPIModel[] = await fetchAISMetadata(path, params);
  return data.map((row) => {
    return {
      name: row.name,
      timestamp: new Date(row.timestamp),
      mmsi: row.mmsi,
      callSign: row.callSign,
      imo: row.imo,
      shipType: row.shipType,
      draught: row.draught / 10,
      eta: parseETA(row.eta),
      posType: row.posType,
      referencePointA: row.referencePointA,
      referencePointB: row.referencePointB,
      referencePointC: row.referencePointC,
      referencePointD: row.referencePointD,
      destination: row.destination,
    };
  });
}

export async function fetchLocations(): Promise<FeatureCollection> {
  const path = aisV1Path + 'locations';
  const params = getTimestampParams();
  const data: VesselLocationFeatureCollection = await fetchAISFeatureCollection(path, params);
  const { dataUpdatedTime, features } = data;
  const geojsonFeatures: Feature<Geometry, GeoJsonProperties>[] = features.map((f) => {
    return {
      type: 'Feature',
      id: f.mmsi,
      geometry: f.geometry,
      properties: {
        ...f.properties,
        dataUpdatedTime,
        timestampExternal: new Date(f.properties.timestampExternal),
        featureType: 'aisvessel',
      },
    };
  });
  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features: geojsonFeatures,
  };
  return collection;
}

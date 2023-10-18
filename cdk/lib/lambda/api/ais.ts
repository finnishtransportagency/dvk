import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { Vessel, VesselLocationFeatureCollection } from './apiModels';
import { fetchAISFeatureCollection, fetchAISMetadata } from './axios';

const aisV1Path = 'ais/api/ais/v1/';

export async function fetchVessels(): Promise<Vessel[]> {
  const path = aisV1Path + 'vessels';
  const data: Vessel[] = await fetchAISMetadata(path);
  return data.map((row) => {
    return {
      name: row.name,
      timestamp: row.timestamp,
      mmsi: row.mmsi,
      callSign: row.callSign,
      imo: row.imo,
      shipType: row.shipType,
      draught: row.draught,
      eta: row.eta,
      posType: row.posType,
      referencePointA: row.referencePointA,
      referencePointB: row.referencePointB,
      referencePointC: row.referencePointC,
      referencePointD: row.referencePointD,
      destination: row.destination,
    };
  });
}

export async function fetchVesselLocations(): Promise<FeatureCollection> {
  const path = aisV1Path + 'locations';
  const data: VesselLocationFeatureCollection = await fetchAISFeatureCollection(path);
  const { dataUpdatedTime, features } = data;
  const geojsonFeatures: Feature<Geometry, GeoJsonProperties>[] = features.map((f) => {
    return {
      type: 'Feature',
      id: f.mmsi,
      geometry: f.geometry,
      properties: {
        ...f.properties,
        dataUpdatedTime,
      },
    };
  });
  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features: geojsonFeatures,
  };
  return collection;
}

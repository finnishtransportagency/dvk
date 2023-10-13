import { Vessel } from '../../../graphql/generated';
import { fetchAISApi } from './axios';

const aisV1Path = 'ais/api/ais/v1/';

export async function fetchVessels(): Promise<Vessel[]> {
  const path = aisV1Path + 'vessels';
  const data = await fetchAISApi<Vessel[]>(path);
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

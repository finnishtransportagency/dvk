import { ALBResult } from 'aws-lambda';
import { getPilotRoutesHeaders } from '../environment';
import { getFromCache } from '../graphql/cache';
import { handleLoaderError, saveResponseToS3 } from '../util';
import { RtzData } from './apiModels';
import { fetchPilotRoutesApi } from './axios';

async function fetchPilotRouteData(): Promise<RtzData[]> {
  const data: RtzData[] = await fetchPilotRoutesApi();
  return data?.map((entry) => {
    return {
      tunnus: entry.tunnus,
      tila: entry.tila,
      nimi: entry.nimi,
      tunniste: entry.tunniste,
      rtz: entry.rtz,
      reittipisteet: entry.reittipisteet?.map((piste) => {
        return {
          tunnus: piste.tunnus,
          nimi: piste.nimi,
          rtzTunniste: piste.rtzTunniste,
          reittitunnus: piste.reittitunnus,
          kaarresade: piste.kaarresade,
          geometria: {
            type: piste.geometria.type,
            coordinates: piste.geometria.coordinates,
          },
          leveysVasen: piste.leveysVasen,
          leveysOikea: piste.leveysOikea,
          geometriaTyyppi: piste.geometriaTyyppi,
          muutosaikaleima: piste.muutosaikaleima,
          jarjestys: piste.jarjestys,
        };
      }),
    };
  });
}

export async function fetchPilotRoutes(key: string): Promise<ALBResult> {
  let base64Response: string | undefined;
  let statusCode = 200;
  const cacheResponse = await getFromCache(key);
  if (!cacheResponse.expired && cacheResponse.data) {
    base64Response = cacheResponse.data;
  } else {
    try {
      const pilotRouteData = await fetchPilotRouteData();
      base64Response = await saveResponseToS3(pilotRouteData, key);
    } catch (e) {
      const errorResult = handleLoaderError(cacheResponse, e);
      base64Response = errorResult.body;
      statusCode = errorResult.statusCode;
    }
  }
  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getPilotRoutesHeaders(),
    },
  };
}

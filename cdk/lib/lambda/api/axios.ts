import axios from 'axios';
import { getSOAApiUrl, getTimeout, getTraficomHeaders, getVatuHeaders, getVatuUrl } from '../environment';
import { log } from '../logger';
import { FeatureCollection, Geometry } from 'geojson';
import { roundGeometry } from '../util';

export async function fetchTraficomApi<T>(path: string) {
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
      throw new Error('Fetching from Traficom api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Traficom api response time: ${duration} ms`);
  return response.data ? (response.data as T) : ({ type: 'FeatureCollection', features: [] } as FeatureCollection);
}

export type GeometryModel = {
  geometria: object;
};

export type MitoitusAlusAPIModel = {
  alustyyppiKoodi: string;
  alustyyppi: string;
  pituus: number;
  leveys: number;
  syvays: number;
  koko?: number;
  runkoTaytelaisyysKerroin?: number;
};

export type LuokitusAPIModel = {
  luokitusTyyppi: string;
  vaylaluokkaKoodi: string;
  vaylaluokkaFI?: string;
  vaylaluokkaSV?: string;
};

export type VaylaAPIModel = {
  jnro: number;
  nimiFI: string;
  nimiSV?: string;
  vaylalajiKoodi?: string;
  vaylaLajiFI?: string;
  vaylaLajiSV?: string;
  valaistusKoodi?: string;
  valaistusFI?: string;
  valaistusSV?: string;
  omistaja?: string;
  merialueFI?: string;
  merialueSV?: string;
  alunSeloste?: string;
  paatepisteenSeloste?: string;
  normaaliKaantosade?: number;
  minimiKaantosade?: number;
  normaaliLeveys?: number;
  minimiLeveys?: number;
  varavesi?: string;
  lisatieto?: string;
  mareografi?: string;
  mitoitusalus?: MitoitusAlusAPIModel[];
  luokitus?: LuokitusAPIModel[];
};

export async function fetchVATUByApi<T extends GeometryModel | VaylaAPIModel>(api: string, params: Record<string, string> = {}) {
  const url = `${await getVatuUrl()}/${api}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getVatuHeaders(),
      params,
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`VATU /${api} fetch failed: params=%o status=%d code=%s message=%s`, params, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from VATU failed');
    });
  log.debug(`/${api} response time: ${Date.now() - start} ms`);
  const datas = response ? (response.data as T[]) : [];
  for (const obj of datas) {
    if ('geometria' in obj) {
      roundGeometry(obj.geometria as Geometry);
    }
  }
  return datas;
}

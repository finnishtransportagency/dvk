import { ALBEvent } from 'aws-lambda';
import axios from 'axios';
import { getVatuHeaders, getVatuUrl } from '../../environment';
import { log } from '../../logger';

export type AlueVaylaAPIModel = {
  jnro: number;
  status: number;
  linjaus: number;
  mitoitusNopeus?: number;
  mitoitusNopeus2?: number;
  nimiFI?: string;
  nimiSV?: string;
};
export type AlueAPIModel = {
  id: number;
  nimi?: string;
  mitoitusSyvays?: number;
  harausSyvyys?: number;
  vertaustaso?: string;
  n2000MitoitusSyvays?: number;
  n2000HarausSyvyys?: number;
  n2000Vertaustaso?: string;
  suunta?: number;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  omistaja?: string;
  lisatieto?: string;
  vayla?: AlueVaylaAPIModel[];
  tyyppiKoodi?: number;
  tyyppi?: string;
  merkintalajiKoodi?: number;
  merkintalaji?: string;
  liikennointiStatusKoodi?: number;
  liikennointiStatus?: string;
  liikennointiTyyppiKoodi?: number;
  liikenteenTyyppi?: string;
  liikennointiSuuntaKoodi?: number;
  liikennointiSuunta?: string;
  geometria: object;
};

export type NavigointiLinjaAPIModel = {
  id: number;
  mitoitusSyvays?: number;
  harausSyvyys?: number;
  vertaustaso?: string;
  n2000MitoitusSyvays?: number;
  n2000HarausSyvyys?: number;
  n2000Vertaustaso?: string;
  tosisuunta?: number;
  pituus?: number;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  omistaja?: string;
  lisatieto?: string;
  tyyppiKoodi?: string;
  tyyppi?: string;
  geometria: object;
  vayla: NavigointiLinjaVaylaAPIModel[];
};
type NavigointiLinjaVaylaAPIModel = {
  jnro: number;
  status?: number;
  linjaus?: number;
  nimiFI?: string;
  nimiSV?: string;
};

export type RajoitusAlueAPIModel = {
  id: number;
  rajoitustyyppi?: string;
  rajoitustyypit?: RajoitustyyppiAPIModel[];
  suuruus?: number;
  esittaja?: string;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  muutosPaivamaara?: string;
  alkuPaivamaara?: string;
  loppuPaivamaara?: string;
  paatosTila?: string;
  tietolahde?: string;
  sijainti?: string;
  kunta?: string;
  poikkeus?: string;
  geometria: object;
  vayla?: RajoitusVaylaAPIModel[];
};
export type RajoitustyyppiAPIModel = {
  koodi?: string;
  rajoitustyyppi?: string;
};
export type RajoitusVaylaAPIModel = {
  jnro: number;
  nimiFI?: string;
  nimiSV?: string;
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

type TurvalaiteVaylaAPIModel = {
  jnro: number;
  paavayla?: string;
};

type TurvalaiteVikatiedotAPIModel = {
  vika_id: number;
  vikatyyppiCDE: number;
  vikatyyppiFI?: string;
  vikatyyppiSE?: string;
};

export type TurvalaiteAPIModel = {
  turvalaitenumero: number;
  nimiFI?: string;
  nimiSV?: string;
  alityyppi?: string;
  turvalaitetyyppiKoodi?: number;
  turvalaitetyyppiFI?: string;
  turvalaitetyyppiSV?: string;
  navigointilajiKoodi?: number;
  navigointilajiFI?: string;
  navigointilajiSV?: string;
  valaistu?: string;
  omistajaFI?: string;
  omistajaSV?: string;
  symboli?: string;
  vayla?: TurvalaiteVaylaAPIModel[];
  vikatiedot?: TurvalaiteVikatiedotAPIModel[];
  geometria: object;
};

export async function fetchVATUByFairwayId<T>(fairwayId: number | number[], api: string) {
  const start = Date.now();
  const ids = Array.isArray(fairwayId) ? fairwayId.join(',') : fairwayId.toString();
  const response = await axios
    .get(`${await getVatuUrl()}/${api}?jnro=${ids}`, {
      headers: await getVatuHeaders(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`VATU /${api}?jnro=${ids} fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
    });
  log.debug(`/${api}?jnro=${ids} response time: ${Date.now() - start} ms`);
  return response ? (response.data as T[]) : [];
}

export async function fetchVATUByFairwayClass<T>(api: string, event: ALBEvent) {
  const fairwayClass = event.queryStringParameters?.vaylaluokka || '1';
  const url = `${await getVatuUrl()}/${api}`;
  const start = Date.now();
  let params = undefined;
  //TODO: remove once bbox not mandatory
  if (api === 'turvalaitteet') {
    params = { vaylaluokka: fairwayClass, bbox: '10,40,40,80' };
  } else {
    params = { vaylaluokka: fairwayClass };
  }
  const response = await axios
    .get(url, {
      headers: await getVatuHeaders(),
      params,
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(
        `VATU /${api}?fairwayClass=${fairwayClass} fetch failed: status=%d code=%s message=%s`,
        errorObj.status,
        errorObj.code,
        errorObj.message
      );
    });
  log.debug(`/${api}?fairwayClass=${fairwayClass} response time: ${Date.now() - start} ms`);
  return response ? (response.data as T[]) : [];
}

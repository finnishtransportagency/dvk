import { ALBEvent } from 'aws-lambda';
import { GeometryModel, VaylaAPIModel, fetchVATUByApi } from '../../api/axios';

export type AlueVaylaAPIModel = {
  jnro: number;
  status: number;
  linjaus: number;
  mitoitusNopeus?: number;
  mitoitusNopeus2?: number;
  vaylaalueenJarjestysNro?: number;
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
} & GeometryModel;

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
  vayla: NavigointiLinjaVaylaAPIModel[];
} & GeometryModel;

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
  vayla?: RajoitusVaylaAPIModel[];
} & GeometryModel;

export type RajoitustyyppiAPIModel = {
  koodi?: string;
  rajoitustyyppi?: string;
};

export type RajoitusVaylaAPIModel = {
  jnro: number;
  nimiFI?: string;
  nimiSV?: string;
};

type TurvalaiteVaylaAPIModel = {
  jnro: number;
  paavayla?: string;
};

export type TurvalaiteVikatiedotAPIModel = {
  vikaId: number;
  turvalaiteNumero: number;
  turvalaiteNimiFI: string;
  turvalaiteNimiSV?: string;
  vikatyyppiKoodi: number;
  vikatyyppiFI: string;
  vikatyyppiSV?: string;
  kirjausAika: string;
} & GeometryModel;

export type TurvalaiteReunaetaisyysAPIModel = {
  vaylaalueID: number;
  etaisyys: number;
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
  kaukohallinta?: number;
  AISTyyppi?: number;
  AISTyyppiSeliteFI?: string;
  AISTyyppiSeliteSV?: string;
  vayla?: TurvalaiteVaylaAPIModel[];
  reunaetaisyys?: TurvalaiteReunaetaisyysAPIModel[];
} & GeometryModel;

export type TaululinjaVaylaAPIModel = {
  jnro: number;
  nimiFI?: string;
  nimiSV?: string;
};

export type TaululinjaAPIModel = {
  taululinjaId: number;
  suunta: number;
  etuTLId?: number;
  keskiTLId?: number;
  takaTLId?: number;
  vayla: TaululinjaVaylaAPIModel[];
} & GeometryModel;

export type KaantoympyraVaylaAPIModel = {
  jnro: number;
  nimiFI: string;
  nimiSV?: string;
  luokitus: number;
};

export type KaantoympyraAPIModel = {
  kaantoympyraID: number;
  halkaisija: number;
  haraussyvyys?: number;
  vertaustaso?: string;
  lisatieto?: string;
  vayla?: KaantoympyraVaylaAPIModel[];
} & GeometryModel;

export async function fetchVATUByFairwayId<T extends GeometryModel | VaylaAPIModel>(fairwayId: number | number[], api: string) {
  const ids = Array.isArray(fairwayId) ? fairwayId.join(',') : fairwayId.toString();
  return fetchVATUByApi<T>(api, { jnro: ids });
}

export async function fetchVATUByFairwayClass<T extends GeometryModel | VaylaAPIModel>(api: string, event: ALBEvent) {
  const fairwayClass = event.multiValueQueryStringParameters?.vaylaluokka?.join(',') || '1';
  return fetchVATUByApi<T>(api, { vaylaluokka: fairwayClass });
}

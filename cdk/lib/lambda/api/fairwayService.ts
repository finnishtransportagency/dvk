import { vuosaari, kemi, uusikaupunki } from './sample/fairways.json';

export type MitoitusAPIModel = {
  id: number;
  tyyppi: number;
  pituus: number;
  leveys: number;
  syvays: number;
  normaaliKaantosade?: number;
  minimiKaantosade?: number;
  normaaliLeveys?: number;
  minimiLeveys?: number;
  varavesi?: string;
  lisatieto?: string;
  mareografi?: string;
};

export type MitoitusAlusAPIModel = {
  id: number;
  tyyppi: number;
  pituus: number;
  leveys: number;
  syvays: number;
};

export type VaylaAPIModel = {
  id: number;
  nimiFI: string;
  nimiSV?: string;
  kulkuSyvyys1?: number;
  kulkuSyvyys2?: number;
  kulkuSyvyys3?: number;
  pituus?: number;
  mitoitukset?: MitoitusAPIModel[];
  mitoitusAlukset?: MitoitusAlusAPIModel[];
};

export class FairwayService {
  public getFairways(): VaylaAPIModel[] {
    // TODO: call vatu api
    return [vuosaari, kemi, uusikaupunki];
  }

  public getFairway(id: number): VaylaAPIModel {
    // TODO: call vatu api
    if (id === 10) {
      return kemi;
    } else if (id === 2345) {
      return uusikaupunki;
    } else {
      return vuosaari;
    }
  }
}

import { Fairway, Sizing, SizingVessel } from '../../../graphql/generated';
import FairwayCardDBModel, { FairwayDBModel } from '../db/fairwayCardDBModel';
import { vuosaari, kemi, uusikaupunki, saimaa_18_19, saimaa_28, saimaa_5 } from './sample/fairways.json';

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
  jnro: number;
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
    return [vuosaari, kemi, uusikaupunki, saimaa_18_19, saimaa_5, saimaa_28];
  }

  public getFairway(id: number): VaylaAPIModel {
    // TODO: call vatu api
    if (id === 10) {
      return kemi;
    } else if (id === 2345) {
      return uusikaupunki;
    } else if (id === 6375) {
      return saimaa_5;
    } else if (id === 7030) {
      return saimaa_18_19;
    } else if (id === 7160) {
      return saimaa_28;
    } else {
      return vuosaari;
    }
  }

  public mapModelsToFairway(apiModel?: VaylaAPIModel, dbModel?: FairwayDBModel): Fairway {
    const fairway: Fairway = {
      id: apiModel?.jnro || dbModel?.id || 0,
      name: {
        fi: apiModel?.nimiFI || '',
        sv: apiModel?.nimiSV || '',
        en: dbModel?.name || '',
      },
      draft1: apiModel?.kulkuSyvyys1,
      draft2: apiModel?.kulkuSyvyys2,
      draft3: apiModel?.kulkuSyvyys3,
      length: apiModel?.pituus,
    };
    const vessels = apiModel?.mitoitusAlukset?.map((vesselModel) => {
      const vessel: SizingVessel = {
        id: vesselModel.id,
        type: vesselModel.tyyppi,
        draft: vesselModel.syvays,
        length: vesselModel.pituus,
        width: vesselModel.leveys,
      };
      return vessel;
    });
    fairway.sizingVessels = vessels;
    const sizings = apiModel?.mitoitukset?.map((sizingModel) => {
      const sizing: Sizing = {
        id: sizingModel.id,
        draft: sizingModel.syvays,
        length: sizingModel.pituus,
        width: sizingModel.leveys,
        additionalInformation: sizingModel.lisatieto,
        reserveWater: sizingModel.varavesi,
        normalWidth: sizingModel.normaaliLeveys,
        normalTurningCircle: sizingModel.normaaliKaantosade,
        minimumWidth: sizingModel.minimiLeveys,
        minimumTurningCircle: sizingModel.minimiKaantosade,
        mareograph: sizingModel.mareografi,
      };
      return sizing;
    });
    fairway.sizings = sizings;
    return fairway;
  }
}

import { vuosaari, kemi, uusikaupunki } from './sample/fairways.json';

export type FairwayAPIModel = {
  id: number;
  nimiFI: string;
  nimiSV?: string;
};

export class FairwayService {
  public getFairways(): FairwayAPIModel[] {
    // TODO: call vatu api
    return [vuosaari, kemi, uusikaupunki];
  }

  public getFairway(id: number): FairwayAPIModel {
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

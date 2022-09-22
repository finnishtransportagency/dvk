import { vuosaari, kemi, uusikaupunki, saimaa } from './sample/navigationLines.json';

export type NavigointiLinjaAPIModel = {
  id: number;
  jnro: number;
  pituus?: number;
  harausSyvyys?: number;
  syvyys?: number;
  geometry: object;
};

export class NavigationLinesService {
  public getNavigationLines(): NavigointiLinjaAPIModel[] {
    // TODO: call vatu api
    return [...vuosaari];
  }

  public getNavigationLinesByFairway(id: number): NavigointiLinjaAPIModel[] {
    // TODO: call vatu api
    if (id === 10) {
      return kemi;
    } else if (id === 2345) {
      return uusikaupunki;
    } else if (id === 4927) {
      return vuosaari;
    } else {
      return saimaa;
    }
  }
}

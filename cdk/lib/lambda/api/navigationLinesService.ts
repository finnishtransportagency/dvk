import { LineString } from 'geojson';
import { vuosaari, kemi, uusikaupunki, saimaa } from './sample/navigationLines.json';

export type NavigointiLinjaAPIModel = {
  id: number;
  jnro: number;
  pituus?: number;
  harausSyvyys?: number;
  syvyys?: number;
  geometry: LineString;
};

export class NavigationLinesService {
  public getNavigationLines(): NavigointiLinjaAPIModel[] {
    // TODO: call vatu api
    return [...(vuosaari as NavigointiLinjaAPIModel[])];
  }

  public getNavigationLinesByFairway(id: number): NavigointiLinjaAPIModel[] {
    // TODO: call vatu api
    if (id === 10) {
      return kemi as NavigointiLinjaAPIModel[];
    } else if (id === 2345) {
      return uusikaupunki as NavigointiLinjaAPIModel[];
    } else if (id === 4927) {
      return vuosaari as NavigointiLinjaAPIModel[];
    } else {
      return saimaa as NavigointiLinjaAPIModel[];
    }
  }
}

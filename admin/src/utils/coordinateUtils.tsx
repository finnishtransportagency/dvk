import { modulo } from 'ol/math';
import { padNumber } from 'ol/string';
import { Maybe } from '../graphql/generated';

const degreesToStringHDM = (hemispheres: string, degrees: number, opt_fractionDigits = 0) => {
  const normalizedDegrees = modulo(degrees + 180, 360) - 180;
  const x = Math.abs(3600 * normalizedDegrees);

  let deg = Math.floor(x / 3600);
  let min = (x - deg * 3600) / 60;
  let hemisphere = '';

  if (min >= 60) {
    min = min - 60;
    deg += 1;
  }

  if (normalizedDegrees !== 0) {
    hemisphere = hemispheres.charAt(normalizedDegrees < 0 ? 1 : 0);
  }

  return deg + '\u00b0 ' + padNumber(min, 2, opt_fractionDigits).replace('.', ',') + '\u2032 ' + hemisphere;
};

export const coordinatesToStringHDM = (coords: number[] | undefined): string => {
  if (coords) {
    return degreesToStringHDM('NS', coords[1], 2) + ' ' + degreesToStringHDM('EW', coords[0], 2);
  } else {
    return '';
  }
};

export function roundCoordinates(coords: Maybe<Maybe<number>[]> | undefined, decimals = 0) {
  const power = Math.pow(10, decimals);
  return coords ? coords.map((coord) => (coord ? Math.round(coord * power) / power : undefined)) : undefined;
}

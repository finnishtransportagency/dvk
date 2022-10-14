import { modulo } from 'ol/math';
import { padNumber } from 'ol/string';

export const degreesToStringHDM = (hemispheres: string, degrees: number, opt_fractionDigits = 0) => {
  const normalizedDegrees = modulo(degrees + 180, 360) - 180;
  const x = Math.abs(3600 * normalizedDegrees);
  const dflPrecision = opt_fractionDigits || 0;
  const precision = Math.pow(10, dflPrecision);
  let deg = Math.floor(x / 3600);
  let min = Math.floor((x - deg * 3600) / 60);
  let sec = x - deg * 3600 - min * 60;

  if (sec >= 60) {
    sec = 0;
    min += 1;
  }
  if (min >= 60) {
    min = 0;
    deg += 1;
  }

  min += sec / 60;
  min = Math.ceil(min * precision) / precision;

  return (
    deg +
    '\u00b0 ' +
    padNumber(min, 2, dflPrecision).replace('.', ',') +
    '\u2032 ' +
    (normalizedDegrees === 0 ? '' : ' ' + hemispheres.charAt(normalizedDegrees < 0 ? 1 : 0))
  );
};

export const coordinatesToStringHDM = (coords: number[] | undefined): string => {
  if (coords) {
    return degreesToStringHDM('NS', coords[1], 2) + ' ' + degreesToStringHDM('EW', coords[0], 2);
  } else {
    return '';
  }
};

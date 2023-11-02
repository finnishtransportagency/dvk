import { countryTable } from './countryCodes';

export const getAisVesselShipType = (typeNumber?: number): string => {
  if (!typeNumber) {
    return 'aisUnspecified';
  }
  if (typeNumber == 36 || typeNumber == 37) {
    return 'aisVesselPleasureCraft';
  } else if ((typeNumber >= 31 && typeNumber <= 35) || (typeNumber >= 50 && typeNumber <= 59)) {
    return 'aisVesselTugAndSpecialCraft';
  } else if (typeNumber >= 40 && typeNumber <= 49) {
    return 'aisVesselHighSpeed';
  } else if (typeNumber >= 60 && typeNumber <= 69) {
    return 'aisVesselPassenger';
  } else if (typeNumber >= 70 && typeNumber <= 79) {
    return 'aisVesselCargo';
  } else if (typeNumber >= 80 && typeNumber <= 89) {
    return 'aisVesselTanker';
  } else {
    return 'aisUnspecified';
  }
};

export const reformatAisVesselDataUpdatedTime = (dateTimeString: Date): string => {
  const dateTime = new Date(dateTimeString);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formattedDatetime = new Intl.DateTimeFormat('fi', options).format(dateTime);

  return formattedDatetime.replace(' ', ', ');
};

export const checkIfMoored = (navState: number): boolean => {
  return !(navState === 0 || navState === 3 || navState === 4 || navState === 7 || navState === 8);
};

export const calculateVesselDimensions = (a?: number, b?: number, c?: number, d?: number): number[] => {
  if (a !== undefined && b !== undefined && c !== undefined && d !== undefined && b > 0 && d > 0) {
    const vesselLength = a + b;
    const vesselWidth = c + d;

    return [vesselLength, vesselWidth];
  }

  return [];
};

export function getCountryCode(mmsi: number): string | undefined {
  // Get MID (maritime identification digit) from mmsi
  const mid = mmsi.toString().substring(0, 3);
  const countryCode = countryTable.get(mid)?.code;
  return countryCode;
}

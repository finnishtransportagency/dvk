import { TFunction } from 'i18next';
import { CountryCode, countryTable } from './countryCodes';

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

export const getNavState = (t: TFunction, navState: number): string | undefined => {
  switch (navState) {
    case 0:
      return t('popup.ais.moving');
    case 1:
      return t('popup.ais.anchored');
    case 2:
      return t('popup.ais.noCommand');
    case 3:
      return t('popup.ais.restricted');
    case 4:
      return t('popup.ais.constrained');
    case 5:
      return t('popup.ais.moored');
    case 6:
      return t('popup.ais.aground');
    case 7:
      return t('popup.ais.fishing');
    case 8:
      return t('popup.ais.sailing');
    case 14:
      return t('popup.ais.emergency');
    default:
      return undefined;
  }
};

export const calculateVesselDimensions = (a?: number, b?: number, c?: number, d?: number): number[] => {
  let vesselLength = 0;
  let vesselWidth = 0;

  if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
    vesselLength = a + b;
    vesselWidth = c + d;
  }

  return [vesselLength, vesselWidth];
};

export function getCountryCode(mmsi: number): CountryCode | undefined {
  // Get MID (maritime identification digit) from mmsi
  const mid = mmsi.toString().substring(0, 3);
  const countryCode = countryTable.get(mid);
  return countryCode;
}

export const isVesselMoving = (navStat: number, speed: number) => {
  const movingNavStats = [0, 2, 3, 4, 7, 8];

  return movingNavStats.includes(navStat) || speed > 3;
};

// Convert AIS rotation speed to degrees per second
export function aisRotToDegreesPerSecond(x: number) {
  if (x < -127 || x > 127) return 0;
  const degreesPerSecond = Math.pow(x / 4.733, 2) / 60;
  return x < 0 ? -degreesPerSecond : degreesPerSecond;
}

/* Get vessel heading. If heading is missing uses cog. If heading and cog are missing returns undefined */
export function getVesselHeading(aisHeading?: number, aisCog?: number): number | undefined {
  if (aisHeading && aisHeading >= 0 && aisHeading < 360) {
    return aisHeading;
  } else if (aisCog && aisCog >= 0 && aisCog < 360) {
    return aisCog;
  }
  return undefined;
}

import { TFunction } from 'i18next';
import { CountryCode, countryTable } from './countryCodes';
import { Point } from 'ol/geom';
import { point as turf_point } from '@turf/helpers';
import { transformTranslate as turf_transformTranslate } from '@turf/transform-translate';
import { MAP } from './constants';

export const getAisVesselShipType = (typeNumber?: number): string => {
  if (!typeNumber) {
    return 'aisunspecified';
  }
  if (typeNumber == 36 || typeNumber == 37) {
    return 'aisvesselpleasurecraft';
  } else if ((typeNumber >= 31 && typeNumber <= 35) || (typeNumber >= 50 && typeNumber <= 59)) {
    return 'aisvesseltugandspecialcraft';
  } else if (typeNumber >= 40 && typeNumber <= 49) {
    return 'aisvesselhighspeed';
  } else if (typeNumber >= 60 && typeNumber <= 69) {
    return 'aisvesselpassenger';
  } else if (typeNumber >= 70 && typeNumber <= 79) {
    return 'aisvesselcargo';
  } else if (typeNumber >= 80 && typeNumber <= 89) {
    return 'aisvesseltanker';
  } else {
    return 'aisunspecified';
  }
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

/* Translate point to heading direction distance meters */
export function translatePoint(point: Point, heading: number, distance: number) {
  const geom = point.clone();
  const wgs84Point = geom.transform(MAP.EPSG, 'EPSG:4326');
  const turfPoint = turf_point(wgs84Point.getCoordinates());
  // Transform given point 1km to headng direction
  const turfPoint2 = turf_transformTranslate(turfPoint, distance / 1000, heading);
  const point2 = new Point(turfPoint2.geometry.coordinates);
  point2.transform('EPSG:4326', MAP.EPSG);
  return point2;
}

/* Get rotation angle on the map (EPSG:4326) at given point based on the wgs84 heading */
export function getPointRotationAngle(point: Point, heading: number) {
  const point2 = translatePoint(point, heading, 1000);
  // calculate angle between tho points in map (EPSG:4326) coordinate system
  const coord1 = point.getCoordinates();
  const coord2 = point2.getCoordinates();
  const angle = Math.atan2(coord2[1] - coord1[1], coord2[0] - coord1[0]);
  return angle > Math.PI / 2 ? 2.5 * Math.PI - angle : 0.5 * Math.PI - angle;
}

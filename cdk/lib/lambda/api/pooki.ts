import { log } from '../logger';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';

export type MarineWarningDates = {
  startDateTime?: number;
  endDateTime?: number;
  dateTime?: number;
};

export function parseDateTimes(feature: Feature<Geometry, GeoJsonProperties>): MarineWarningDates {
  const dateFormat = /(\d{1,2}).(\d{1,2}).(\d{4}) (\d{1,2}):(\d{1,2})/;
  let dateTime, startDateTime, endDateTime;
  if (feature.properties?.PAIVAYS) {
    try {
      const [, day, month, year, hours, minutes] = dateFormat.exec(feature.properties?.PAIVAYS) as RegExpExecArray;
      dateTime = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes)).getTime();
    } catch (e) {
      log.error('Error parsing date: %s', feature.properties?.PAIVAYS);
      dateTime = Date.parse(feature.properties?.TALLENNUSPAIVA);
    }
  } else {
    dateTime = Date.parse(feature.properties?.TALLENNUSPAIVA);
  }
  if (feature.properties?.VOIMASSA_ALKAA && feature.properties.VOIMASSA_ALKAA.length === 10) {
    startDateTime = Date.parse(feature.properties.VOIMASSA_ALKAA + ' 00:00');
  } else {
    startDateTime = Date.parse(feature.properties?.VOIMASSA_ALKAA);
  }
  if (feature.properties?.VOIMASSA_PAATTYY && feature.properties.VOIMASSA_PAATTYY.length === 10) {
    endDateTime = Date.parse(feature.properties.VOIMASSA_PAATTYY + ' 00:00');
  } else {
    endDateTime = Date.parse(feature.properties?.VOIMASSA_PAATTYY);
  }
  return { dateTime, startDateTime, endDateTime };
}

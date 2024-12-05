/* eslint-disable @typescript-eslint/no-explicit-any */
import { Geometry, Point, Position } from 'geojson';
import { log } from '../logger';
import { roundGeometry } from '../util';
import { XMLParser } from 'fast-xml-parser';
import { fetchIlmanetApi, fetchWeatherApi, fetchWeatherApiResponse } from './axios';
import {
  Mareograph,
  WeatherMareograph,
  Observation,
  WeatherObservation,
  Buoy,
  WeatherBuoy,
  WeatherWaveForecastApi,
  WeatherWaveForecast,
} from './apiModels';
import { PilotPlace } from '../../../graphql/generated';
import { Text } from '../db/fairwayCardDBModel';

function parseLocation(location: any): Partial<Mareograph> {
  return {
    id: location['@_id'],
    name: location['@_name'],
    geometry: roundGeometry({ type: 'Point', coordinates: [Number.parseFloat(location['@_lon']), Number.parseFloat(location['@_lat'])] }),
  };
}

function parseObservation(observation: any): Partial<Mareograph> {
  return {
    dateTime: Date.parse(observation['@_time']),
    waterLevel: Number.parseFloat(observation.param.filter((p: any) => p['@_name'] === 'InterpolatedSeaLevel')[0]['@_value']) * 10,
    n2000WaterLevel: Number.parseFloat(observation.param.filter((p: any) => p['@_name'] === 'InterpolatedSeaLevelN2000')[0]['@_value']) * 10,
  };
}

function parseMeasure(location: any): Partial<Mareograph> {
  let measure;
  if (Array.isArray(location.observation)) {
    for (const observation of location.observation) {
      const result = parseObservation(observation);
      if (!Number.isNaN(result.waterLevel) && !Number.isNaN(result.n2000WaterLevel)) {
        if (!measure || (measure.dateTime as number) < (result.dateTime as number)) {
          measure = result;
        }
      }
    }
  } else {
    measure = parseObservation(location.observation);
  }
  return measure ?? {};
}

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
};
const parser = new XMLParser(options);
parser.addEntity('#xE4', 'ä');
parser.addEntity('#228', 'ä');
parser.addEntity('#xC4', 'Ä');
parser.addEntity('#196', 'Ä');
parser.addEntity('#xF6', 'ö');
parser.addEntity('#246', 'ö');
parser.addEntity('#xD6', 'Ö');
parser.addEntity('#214', 'Ö');
parser.addEntity('#xE5', 'å');
parser.addEntity('#229', 'å');
parser.addEntity('#xC5', 'Å');
parser.addEntity('#197', 'Å');

const HELSINKI_BBOX = [
  //Define lower left and upper right
  [24.6667, 59.8667],
  [25.4, 60.2667],
];
const SAARISTOMERI_BBOX = [
  //Define lower left and upper right
  [20.0667, 59.6],
  [22.4667, 60.8],
];
type ExtraForecastLocation = {
  name: Text;
  coords: Position;
};
const EXTRA_FORECAST_LOCATIONS: ExtraForecastLocation[] = [
  { name: { fi: 'Sundinkari', sv: 'Sundinkari', en: 'Sundinkari' }, coords: [60.786888, 21.325472] },
  {
    name: { fi: 'Jakob Ramsjö säähavaintoasema', sv: 'Jakob Ramsjö säähavaintoasema', en: 'Jakob Ramsjö säähavaintoasema' },
    coords: [59.994667, 23.995667],
  },
  { name: { fi: 'Isomatala', sv: 'Isomatala', en: 'Isomatala' }, coords: [60.785838, 21.226705] },
  { name: { fi: 'Rajakari', sv: 'Rajakari', en: 'Rajakari' }, coords: [60.37799, 22.096668] },
];

function parseXml(xml: string): Mareograph[] {
  const mareographs: Mareograph[] = [];
  try {
    if (xml) {
      const obj = parser.parse(xml);
      if (Array.isArray(obj.pointweather.location)) {
        for (const location of obj.pointweather.location) {
          const mareograph = parseLocation(location);
          mareographs.push({ ...mareograph, ...parseMeasure(location), calculated: true } as Mareograph);
        }
      } else {
        const mareograph = parseLocation(obj.pointweather.location);
        mareographs.push({ ...mareograph, ...parseMeasure(obj.pointweather.location), calculated: true } as Mareograph);
      }
    }
  } catch (e) {
    log.fatal('Parsing Ilmanet xml failed: %s', e);
  }
  return mareographs;
}

function parseGeometry(latlonString: string): Geometry {
  const latlon = latlonString.split(',');
  const geometry: Geometry = { type: 'Point', coordinates: [Number.parseFloat(latlon[1].trim()), Number.parseFloat(latlon[0].trim())] };
  roundGeometry(geometry);
  return geometry;
}

export async function fetchMareoGraphs(): Promise<Mareograph[]> {
  const [weatherResponse, ilmanetResponse] = await Promise.all([
    fetchWeatherApi<WeatherMareograph>(
      'timeseries?param=fmisid,geoid,latlon,station_name,localtime,WLEV_PT1S_INSTANT,WLEVN2K_PT1S_INSTANT&precision=double&endtime=now&producer=observations_fmi&timeformat=sql&format=json&keyword=mareografit'
    ),
    fetchIlmanetApi(),
  ]);

  return weatherResponse
    .map((measure) => {
      return {
        id: measure.fmisid,
        name: measure.station_name,
        n2000WaterLevel: measure.WLEVN2K_PT1S_INSTANT,
        waterLevel: measure.WLEV_PT1S_INSTANT,
        dateTime: Date.parse(measure.localtime),
        geometry: parseGeometry(measure.latlon),
        calculated: false,
      };
    })
    .concat(parseXml(ilmanetResponse));
}

export async function fetchWeatherObservations(): Promise<Observation[]> {
  return (
    await fetchWeatherApi<WeatherObservation>(
      'timeseries?param=fmisid,geoid,latlon,stationname,localtime,WG_PT10M_MAX,WD_PT10M_AVG,WS_PT10M_AVG,TA_PT1M_AVG,VIS_PT1M_AVG&fmisid=101256,151028,151048,151029,101252,101436,101628,101580,105430&keyword=virpo_sea_all&endtime=now&precision=double&producer=observations_fmi&timeformat=sql&format=json'
    )
  ).map((measure) => {
    return {
      id: measure.fmisid ?? measure.geoid ?? measure.latlon,
      name: measure.stationname,
      windSpeedAvg: measure.WS_PT10M_AVG,
      windSpeedMax: measure.WG_PT10M_MAX,
      windDirection: measure.WD_PT10M_AVG,
      visibility: measure.VIS_PT1M_AVG,
      temperature: measure.TA_PT1M_AVG,
      dateTime: Date.parse(measure.localtime),
      geometry: parseGeometry(measure.latlon),
    };
  });
}

function getForecastLocations(pilotPoints: PilotPlace[], extraForecastLocations: ExtraForecastLocation[], searchRadius: number = 5): string {
  //Take all pilot places and additional defined locations
  return (
    '&latlons=' +
    pilotPoints
      .map((p) => {
        if (p.geometry.coordinates) {
          return p.geometry.coordinates[1] + ',' + p.geometry.coordinates[0] + ':' + searchRadius;
        } else {
          return null;
        }
      })
      .join() +
    (extraForecastLocations.length > 0 ? ',' : '') +
    extraForecastLocations.map((c) => c.coords.join() + ':' + searchRadius).join()
  );
}

//Map a location to a pilot place to get the id and name based on matching the point
function mapToPilotPlace(pilotPoints: PilotPlace[], extraLocations: ExtraForecastLocation[], latlon: string) {
  const pilotPlace = pilotPoints.find(
    (p) =>
      p.geometry.coordinates != null &&
      p.geometry.coordinates[0] === parseFloat(latlon?.split(',')[0]?.trim()) &&
      p.geometry.coordinates[1] === parseFloat(latlon?.split(',')[1]?.trim())
  );
  if (pilotPlace == null) {
    const extraLocation = extraLocations.find(
      (l) =>
        l.coords != null && l.coords[0] === parseFloat(latlon?.split(',')[0]?.trim()) && l.coords[1] === parseFloat(latlon?.split(',')[1]?.trim())
    );
    return extraLocation != null ? { id: null, name: extraLocation.name } : { id: null, name: null };
  } else {
    return pilotPlace ?? { id: null, name: null };
  }
}

function removeSearchRadius(place: string): string {
  return place.includes(':') ? place.slice(0, place.lastIndexOf(':')) : place;
}

function getWaveDirectionAndHeight(geom: Point, measure: WeatherWaveForecastApi) {
  if (isInBoundingBox(geom.coordinates, HELSINKI_BBOX)) {
    return { waveDirection: measure.waveDirectionHelsinki ?? measure.waveDirection, waveHeight: measure.waveHeightHelsinki ?? measure.waveHeight };
  }
  if (isInBoundingBox(geom.coordinates, SAARISTOMERI_BBOX)) {
    return {
      waveDirection: measure.waveDirectionSaaristomeri ?? measure.waveDirection,
      waveHeight: measure.waveHeightSaaristomeri ?? measure.waveHeight,
    };
  }
  return { waveDirection: measure.waveDirection, waveHeight: measure.waveHeight };
}

function isInBoundingBox(point: Position, bbox: number[][]) {
  //No need to use OL to do simple bbox check here
  return bbox[0][0] <= point[0] && bbox[0][1] <= point[1] && bbox[1][0] >= point[0] && bbox[1][1] >= point[1];
}

function isInHelsinki(point: PilotPlace | ExtraForecastLocation) {
  return isInBoundingBox('geometry' in point ? (point.geometry as Point).coordinates : point.coords, HELSINKI_BBOX);
}

function isInSaaristomeri(point: PilotPlace | ExtraForecastLocation) {
  return isInBoundingBox('geometry' in point ? (point.geometry as Point).coordinates : point.coords, SAARISTOMERI_BBOX);
}

function isNeitherInHelsinkiNorSaaristomeri(point: PilotPlace | ExtraForecastLocation) {
  return !isInHelsinki(point) && !isInSaaristomeri(point);
}

function getPath(
  pilotPoints: PilotPlace[],
  extraForecastLocations: ExtraForecastLocation[],
  areaFilter: (item: PilotPlace | ExtraForecastLocation) => boolean,
  includeHelsinki: boolean,
  includeSaaristomeri: boolean,
  numberTimesteps: number = 48
): string {
  const searchRadius = 6;

  const fields = [
    'place',
    'localtime',
    'nanmedian(DD-D:::6:10:1) as windDirection',
    'nanmax(FF-MS:::6:10:1) as windSpeed',
    'nanmax(FFG-MS:::6:10:1) as windGust',
    'nanmedian(DPW-D:WAM_BALMFC:1061:6:0:1) as waveDirection',
    'nanmax(HWS-M:WAM_BALMFC:1061:6:0:1) as waveHeight',
    includeHelsinki ? 'nanmedian(DPW-D:WAM_HKI:1117:6:0:1) as waveDirectionHelsinki' : '',
    includeHelsinki ? 'nanmax(HWS-M:WAM_HKI:1117:6:0:1) as waveHeightHelsinki' : '',
    includeSaaristomeri ? 'nanmedian(DPW-D:WAM_BALMFC_ARCH:1119:6:0:1) as waveDirectionSaaristomeri' : '',
    includeSaaristomeri ? 'nanmax(HWS-M:WAM_BALMFC_ARCH:1119:6:0:1) as waveHeightSaaristomeri' : '',
    'nanmedian(MUL{VV2-M:MEPSMTA:1093:6:0:4:0;0.001}) as visibility',
  ];
  const responseDetails = '&precision=double&format=json&timeformat=sql';
  return (
    'timeseries?param=' +
    encodeURIComponent(fields.filter((f) => f.length > 0).join()) +
    getForecastLocations(pilotPoints.filter(areaFilter), extraForecastLocations.filter(areaFilter), searchRadius) +
    responseDetails +
    '&timesteps=' +
    numberTimesteps
  );
}

export async function fetchWeatherWaveForecast(pilotPoints: PilotPlace[]): Promise<{
  forecast: WeatherWaveForecast[];
  responseTime: any;
}> {
  let responseTime;
  let allResults: WeatherWaveForecastApi[] = [];

  const path1 = getPath(pilotPoints, EXTRA_FORECAST_LOCATIONS, (p) => isNeitherInHelsinkiNorSaaristomeri(p), false, false);
  const path2 = getPath(pilotPoints, EXTRA_FORECAST_LOCATIONS, (p) => isInSaaristomeri(p), false, true);
  const path3 = getPath(pilotPoints, EXTRA_FORECAST_LOCATIONS, (p) => isInHelsinki(p), true, false);

  await Promise.all([fetchWeatherApiResponse(path1), fetchWeatherApiResponse(path2), fetchWeatherApiResponse(path3)]).then((values) => {
    responseTime = (values[0].headers.date ?? Date.now()) as number;
    values.forEach((v) => {
      const items = v.data as WeatherWaveForecastApi[];
      items.forEach((i) => allResults.push(i));
    });
  });

  const forecast = Object.values(
    allResults
      .map((measure) => {
        const latlng = removeSearchRadius(measure.place);
        const geometry = parseGeometry(removeSearchRadius(measure.place));
        const { waveHeight, waveDirection } = getWaveDirectionAndHeight(geometry as Point, measure);
        const { id, name } = mapToPilotPlace(pilotPoints, EXTRA_FORECAST_LOCATIONS, latlng);
        return {
          id: id?.toString() ?? latlng,
          name: name,
          pilotPlaceId: id,
          windSpeed: measure.windSpeed,
          windGust: measure.windGust,
          windDirection: measure.windDirection,
          waveHeight: waveHeight,
          waveDirection: waveDirection,
          visibility: measure.visibility,
          dateTime: Date.parse(measure.localtime),
          geometry: geometry,
        };
      })
      .reduce(
        (acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = { id: item.id, pilotPlaceId: item.pilotPlaceId, name: item.name, geometry: item.geometry, forecastItems: [] };
          }
          acc[item.id].forecastItems.push({
            dateTime: item.dateTime,
            visibility: item.visibility,
            windDirection: item.windDirection,
            windSpeed: item.windSpeed,
            windGust: item.windGust,
            waveHeight: item.waveHeight,
            waveDirection: item.waveDirection,
          });
          return acc;
        },
        {} as Record<string, WeatherWaveForecast>
      )
  );
  return { forecast, responseTime };
}

export async function fetchBuoys(): Promise<Buoy[]> {
  const buoys = (
    await fetchWeatherApi<WeatherBuoy>(
      'timeseries?param=fmisid,geoid,latlon,station_name,localtime,WH_PT1M_ACC,WHD_PT1M_ACC,TW_PT1M_AVG&fmisid=103976,134220,134221,134246,137228&precision=double&starttime=-2h&timestep=data&producer=observations_fmi&timeformat=sql&format=json'
    )
  )
    .map((measure) => {
      return {
        id: measure.fmisid,
        name: measure.station_name,
        dateTime: Date.parse(measure.localtime),
        geometry: parseGeometry(measure.latlon),
        temperature: measure.TW_PT1M_AVG,
        waveDirection: measure.WHD_PT1M_ACC,
        waveHeight: measure.WH_PT1M_ACC,
      };
    })
    .sort((a, b) => a.dateTime - b.dateTime);

  const latestObservations = new Map<number, Buoy>();
  for (const buoy of buoys) {
    if (
      !latestObservations.has(buoy.id) ||
      ((latestObservations.get(buoy.id)?.dateTime || 0) < buoy.dateTime && buoy.temperature && buoy.waveDirection && buoy.waveHeight)
    ) {
      latestObservations.set(buoy.id, buoy);
    }
  }
  return [...latestObservations.values()];
}

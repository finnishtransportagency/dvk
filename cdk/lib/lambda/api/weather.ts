/* eslint-disable @typescript-eslint/no-explicit-any */
import { Geometry, Point } from 'geojson';
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

const HelsinkiArea = [
  [24.6667, 25.4],
  [59.8667, 60.2667],
];
const SaaristomeriArea = [
  [20.0667, 22.4667],
  [59.6, 60.8],
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

function getCommonForecastLocations(pilotPoints: PilotPlace[], searchRadius: number = 5): string {
  //Take all pilot places and additional defined locations
  const extraCoordinates = [
    [60.786888, 21.325472],
    [59.994667, 23.995667],
    [60.785838, 21.226705],
    [60.37799, 22.096668],
  ];
  return (
    '&latlons=' +
    pilotPoints.map((p) => p.geometry.coordinates?.reverse().join() + ':' + searchRadius).join() +
    ',' +
    extraCoordinates.map((c) => c.join() + ':' + searchRadius).join()
  );
}

//Map a location to a pilot place to get the id and name based on matching the point
function mapToPilotPlace(pilotPoints: PilotPlace[], latlon: string) {
  return pilotPoints.find(
    (p) =>
      p.geometry.coordinates != null &&
      p.geometry.coordinates[0] === parseFloat(latlon?.split(',')[0]?.trim()) &&
      p.geometry.coordinates[1] === parseFloat(latlon?.split(',')[1]?.trim())
  );
}

function removeSearchRadius(place: string): string {
  return place.includes(':') ? place.slice(0, place.lastIndexOf(':')) : place;
}

function getWaveDirectionAndHeight(geom: Point, measure: WeatherWaveForecastApi) {
  if (isInBoundingBox(geom, HelsinkiArea)) {
    return { waveDirection: measure.waveDirectionHelsinki ?? measure.waveDirection, waveHeight: measure.waveHeightHelsinki ?? measure.waveHeight };
  }
  if (isInBoundingBox(geom, SaaristomeriArea)) {
    return {
      waveDirection: measure.waveDirectionSaaristomeri ?? measure.waveDirection,
      waveHeight: measure.waveHeightSaaristomeri ?? measure.waveHeight,
    };
  }
  return { waveDirection: measure.waveDirection, waveHeight: measure.waveHeight };
}

function isInBoundingBox(point: Point, bbox: number[][]) {
  //No need to use OL to do simple bbox check here
  return (
    bbox[0][0] <= point.coordinates[0] &&
    bbox[0][1] >= point.coordinates[0] &&
    bbox[1][0] <= point.coordinates[1] &&
    bbox[1][1] >= point.coordinates[1]
  );
}

export async function fetchWeatherWaveForecast(
  pilotPoints: PilotPlace[],
  numberTimesteps: number = 48
): Promise<{
  forecast: WeatherWaveForecast[];
  responseTime: any;
}> {
  const searchRadius = 6;
  const fields = [
    'place',
    'localtime',
    'median(DD-D:::6:10:1) as windDirection',
    'max(FF-MS:::6:10:1) as windSpeed',
    'max(FFG-MS:::6:10:1) as windGust',
    'nanmedian(DPW-D:WAM_BALMFC:1061:6:0:1) as waveDirection',
    'max(HWS-M:WAM_BALMFC:1061:6:0:1) as waveHeight',
    'nanmedian(DPW-D:WAM_HKI:1117:6:0:1) as waveDirectionHelsinki',
    'nanmax(HWS-M:WAM_HKI:1117:6:0:1) as waveHeightHelsinki',
    'nanmedian(DPW-D:WAM_BALMFC_ARCH:1119:6:0:1) as waveDirectionSaaristomeri',
    'nanmax(HWS-M:WAM_BALMFC_ARCH:1119:6:0:1) as waveHeightSaaristomeri',
    'nanmedian(MUL{VV2-M:MEPSMTA:1093:6:0:4:0;0.001}) as visibility',
  ];

  const responseDetails = '&precision=double&format=json&timeformat=sql';

  const response = await fetchWeatherApiResponse(
    'timeseries?param=' +
      encodeURIComponent(fields.join()) +
      getCommonForecastLocations(pilotPoints, searchRadius) +
      responseDetails +
      '&timesteps=' +
      numberTimesteps
  );
  const responseTime = (response.headers.date ?? Date.now()) as number;

  const forecast = Object.values(
    (response.data as WeatherWaveForecastApi[])
      .map((measure) => {
        const latlng = removeSearchRadius(measure.place);
        const geometry = parseGeometry(removeSearchRadius(measure.place));
        const { waveHeight, waveDirection } = getWaveDirectionAndHeight(geometry as Point, measure);
        const pilotPlaceId = mapToPilotPlace(pilotPoints, latlng)?.id;
        return {
          id: pilotPlaceId?.toString() ?? latlng,
          pilotPlaceId: pilotPlaceId,
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
            acc[item.id] = { id: item.id, pilotPlaceId: item.pilotPlaceId, geometry: item.geometry, forecastItems: [] };
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Geometry } from 'geojson';
import { getIlmanetPassword, getIlmanetUrl, getIlmanetUsername, getWeatherHeaders, getSOAApiUrl } from '../environment';
import { log } from '../logger';
import { roundGeometry } from '../util';
import { XMLParser } from 'fast-xml-parser';

type WeatherMareograph = {
  fmisid: number;
  geoid: number;
  latlon: string;
  station_name: string;
  localtime: string;
  WLEV_PT1S_INSTANT: number;
  WLEVN2K_PT1S_INSTANT: number;
};

export type Mareograph = {
  id: number;
  geometry: Geometry;
  name: string;
  dateTime: number;
  waterLevel: number;
  n2000WaterLevel: number;
  calculated: boolean;
};

type WeatherObservation = {
  fmisid: number;
  geoid: number;
  latlon: string;
  name: string;
  localtime: string;
  WG_PT10M_MAX: number;
  WD_PT10M_AVG: number;
  WS_PT10M_AVG: number;
  TA_PT1M_AVG: number;
  VIS_PT1M_AVG: number | null;
};

export type Observation = {
  id: number;
  name: string;
  windSpeedAvg: number;
  windSpeedMax: number;
  windDirection: number;
  visibility: number | null;
  temperature: number;
  dateTime: number;
  geometry: Geometry;
};

type WeatherBuoy = {
  fmisid: number;
  geoid: number;
  latlon: string;
  station_name: string;
  localtime: string;
  WH_PT1M_ACC: number | null;
  WHD_PT1M_ACC: number | null;
  TW_PT1M_AVG: number | null;
};

export type Buoy = {
  id: number;
  name: string;
  dateTime: number;
  geometry: Geometry;
  temperature: number | null;
  waveDirection: number | null;
  waveHeight: number | null;
};

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
  return measure || {};
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

export function parseXml(xml: string): Mareograph[] {
  const mareographs: Mareograph[] = [];
  try {
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
  } catch (e) {
    log.fatal('Parsing Ilmanet xml failed: %s', e);
  }
  return mareographs;
}

async function fetchIlmanetApi(): Promise<Mareograph[]> {
  const start = Date.now();
  const response = await axios
    .get(await getIlmanetUrl(), {
      params: {
        username: await getIlmanetUsername(),
        password: await getIlmanetPassword(),
        orderId: 165689,
      },
      headers: await getWeatherHeaders(),
      timeout: 10000,
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Ilmanet api fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Ilmanet api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Ilmanet api response time: ${duration} ms`);
  return response.data ? parseXml(response.data as string) : [];
}

async function fetchApi<T>(path: string) {
  const url = `https://${await getSOAApiUrl()}/fmi/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getWeatherHeaders(),
      timeout: 10000,
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Weather api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Weather api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Weather api ${path} response time: ${duration} ms`);
  return response.data ? (response.data as T[]) : [];
}

function parseGeometry(latlonString: string): Geometry {
  const latlon = latlonString.split(',');
  const geometry: Geometry = { type: 'Point', coordinates: [Number.parseFloat(latlon[1].trim()), Number.parseFloat(latlon[0].trim())] };
  roundGeometry(geometry);
  return geometry;
}

export async function fetchMareoGraphs(): Promise<Mareograph[]> {
  return (
    await fetchApi<WeatherMareograph>(
      'timeseries?param=fmisid,geoid,latlon,station_name,localtime,WLEV_PT1S_INSTANT,WLEVN2K_PT1S_INSTANT&precision=double&endtime=now&producer=observations_fmi&timeformat=sql&format=json&keyword=mareografit'
    )
  )
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
    .concat(await fetchIlmanetApi());
}

export async function fetchWeatherObservations(): Promise<Observation[]> {
  return (
    await fetchApi<WeatherObservation>(
      'timeseries?param=fmisid,geoid,latlon,name,localtime,WG_PT10M_MAX,WD_PT10M_AVG,WS_PT10M_AVG,TA_PT1M_AVG,VIS_PT1M_AVG&fmisid=101256,151028,151048,151029,101252,101436,101628,101580,105430&keyword=virpo_sea_all&endtime=now&precision=double&producer=observations_fmi&timeformat=sql&format=json'
    )
  ).map((measure) => {
    return {
      id: measure.fmisid,
      name: measure.name,
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

export async function fetchBuoys(): Promise<Buoy[]> {
  const buoys = (
    await fetchApi<WeatherBuoy>(
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

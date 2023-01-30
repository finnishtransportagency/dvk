import axios from 'axios';
import { Geometry } from 'geojson';
import { getWeatherApiKey, getWeatherHeaders, getWeatherSOAUrl } from '../environment';
import { log } from '../logger';
import { roundGeometry } from '../util';

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

async function fetchApi<T>(path: string) {
  const start = Date.now();
  // TODO: remove apikey once SOA api exists
  const url = `https://${await getWeatherSOAUrl()}/fmi-apikey/${await getWeatherApiKey()}/${path}`;
  const response = await axios
    .get(url, {
      headers: await getWeatherHeaders(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Weather api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Weather api failed');
    });
  log.debug(`Weather api response time: ${Date.now() - start} ms`);
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
  ).map((measure) => {
    return {
      id: measure.fmisid,
      name: measure.station_name,
      n2000WaterLevel: measure.WLEVN2K_PT1S_INSTANT,
      waterLevel: measure.WLEV_PT1S_INSTANT,
      dateTime: Date.parse(measure.localtime),
      geometry: parseGeometry(measure.latlon),
    };
  });
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

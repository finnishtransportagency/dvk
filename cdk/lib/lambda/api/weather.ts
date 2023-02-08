/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Geometry } from 'geojson';
import { getIlmanetPassword, getIlmanetUrl, getIlmanetUsername, getWeatherHeaders, getSOAApiUrl } from '../environment';
import { log } from '../logger';
import { roundGeometry } from '../util';
import { transform } from 'camaro';

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

type ParamXML = {
  name: string;
  value: number;
};

type ObservationXML = {
  time: string;
  params: ParamXML[];
};

type MareographXML = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  observations: ObservationXML[];
};

export async function parseXml(xml: string): Promise<Mareograph[]> {
  const template = [
    'pointweather/location',
    {
      name: '@name',
      id: 'number(@id)',
      lat: 'number(@lat)',
      lon: 'number(@lon)',
      observations: ['observation', { time: '@time', params: ['param', { name: '@name', value: 'number(@value)' }] }],
    },
  ];
  const mareographs: Mareograph[] = [];
  try {
    const mareographXmls = (await transform(xml, template)) as MareographXML[];
    for (const m of mareographXmls) {
      const latestObs = [...m.observations].sort((a, b) => Date.parse(b.time) - Date.parse(a.time))[0];
      const waterLevel = latestObs.params.find((p) => p.name === 'InterpolatedSeaLevel')?.value;
      const n2000WaterLevel = latestObs.params.find((p) => p.name === 'InterpolatedSeaLevelN2000')?.value;
      if (waterLevel !== undefined && n2000WaterLevel !== undefined) {
        mareographs.push({
          id: m.id,
          name: m.name,
          calculated: true,
          dateTime: Date.parse(latestObs.time),
          geometry: { type: 'Point', coordinates: [m.lon, m.lat] },
          waterLevel: waterLevel * 10,
          n2000WaterLevel: n2000WaterLevel * 10,
        });
      }
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
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Ilmanet api fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Ilmanet api failed');
    });
  log.debug(`Ilmanet api response time: ${Date.now() - start} ms`);
  return response.data ? parseXml(response.data as string) : [];
}

async function fetchApi<T>(path: string) {
  const start = Date.now();
  const url = `https://${await getSOAApiUrl()}/fmi/${path}`;
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

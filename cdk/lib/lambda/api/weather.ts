import axios from 'axios';
import { Geometry } from 'geojson';
import { getWeatherApiKey, getWeatherHeaders, getWeatherUrl } from '../environment';
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

export async function fetchMareoGraphs(): Promise<Mareograph[]> {
  const start = Date.now();
  // TODO: remove apikey once SOA api exists
  const url = `${await getWeatherUrl()}/${await getWeatherApiKey()}/timeseries?param=fmisid,geoid,latlon,station_name,localtime,WLEV_PT1S_INSTANT,WLEVN2K_PT1S_INSTANT&precision=double&endtime=now&producer=observations_fmi&timeformat=sql&format=json&keyword=mareografit`;
  const response = await axios
    .get(url, {
      headers: await getWeatherHeaders(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Weather api fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Weather api failed');
    });
  log.debug(`Weather api response time: ${Date.now() - start} ms`);
  if (response?.data) {
    return (response.data as WeatherMareograph[]).map((measure) => {
      const latlon = measure.latlon.split(',');
      const geometry: Geometry = { type: 'Point', coordinates: [Number.parseFloat(latlon[1].trim()), Number.parseFloat(latlon[0].trim())] };
      roundGeometry(geometry);
      return {
        id: measure.fmisid,
        name: measure.station_name,
        n2000WaterLevel: measure.WLEVN2K_PT1S_INSTANT,
        waterLevel: measure.WLEV_PT1S_INSTANT,
        dateTime: Date.parse(measure.localtime),
        geometry,
      };
    });
  }
  return [];
}

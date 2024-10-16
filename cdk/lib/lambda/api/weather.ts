/* eslint-disable @typescript-eslint/no-explicit-any */
import { Geometry } from 'geojson';
import { log } from '../logger';
import { roundGeometry } from '../util';
import { XMLParser } from 'fast-xml-parser';
import { fetchIlmanetApi, fetchWeatherApi } from './axios';
import { Mareograph, WeatherMareograph, Observation, WeatherObservation, Buoy, WeatherBuoy } from './apiModels';

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
      id: measure.fmisid,
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

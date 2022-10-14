import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill, Icon } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
// eslint-disable-next-line import/named
import { FeatureLike } from 'ol/Feature';
import Map from 'ol/Map';
import pilot_logo from '../theme/img/pilotPlace.svg';
import CircleStyle from 'ol/style/Circle';

const url = process.env.REACT_APP_REST_API_URL ? process.env.REACT_APP_REST_API_URL + '/featureloader' : '/api/featureloader';

export function addVatuLayer(map: Map, queryString: string, id: string) {
  const vatuSource = new VectorSource({
    url: url + queryString,
    format: new GeoJSON({ featureProjection: 'EPSG:4258' }),
  });
  const styleFunction = function (feature: FeatureLike) {
    return new Style({
      stroke: new Stroke({
        color: feature.getGeometry()?.getType() === 'LineString' ? 'blue' : 'red',
        width: 1,
      }),
    });
  };
  const vatuLayer = new VectorLayer({
    source: vatuSource,
    style: styleFunction,
    properties: { id },
  });
  map.addLayer(vatuLayer);
}

export function addPilotLayer(map: Map) {
  const image = new Icon({
    src: pilot_logo,
  });
  const style = [
    new Style({
      image,
    }),
    new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
      }),
    }),
  ];
  const pilotSource = new VectorSource({
    url: url + '?type=pilot',
    format: new GeoJSON({ featureProjection: 'EPSG:4326' }),
  });
  const pilotLayer = new VectorLayer({
    source: pilotSource,
    style,
    properties: { id: 'pilot' },
  });
  map.addLayer(pilotLayer);
}

export function addAPILayers(map: Map) {
  addVatuLayer(map, '?type=area', 'area');
  addVatuLayer(map, '?type=line&vaylaluokka=1', 'line1');
  addVatuLayer(map, '?type=line&vaylaluokka=2', 'line2');
  addVatuLayer(map, '?type=line&vaylaluokka=3', 'line3');
  addVatuLayer(map, '?type=line&vaylaluokka=4', 'line4');
  addPilotLayer(map);
}

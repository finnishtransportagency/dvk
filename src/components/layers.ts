import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill, Icon } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import pilot_logo from '../theme/img/pilotPlace.svg';
import CircleStyle from 'ol/style/Circle';

const url = process.env.REACT_APP_REST_API_URL ? process.env.REACT_APP_REST_API_URL + '/featureloader' : '/api/featureloader';

export function addVatuLayer(map: Map, queryString: string, id: string, color: string, maxResolution: number | undefined = undefined, width = 1) {
  const vatuSource = new VectorSource({
    url: url + queryString,
    format: new GeoJSON({ featureProjection: 'EPSG:4258' }),
  });
  const styleFunction = function () {
    return new Style({
      stroke: new Stroke({
        color,
        width,
      }),
    });
  };
  const vatuLayer = new VectorLayer({
    source: vatuSource,
    style: styleFunction,
    properties: { id },
    maxResolution,
    renderBuffer: 2000,
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
    renderBuffer: 2000,
  });
  map.addLayer(pilotLayer);
}

export function addAPILayers(map: Map) {
  // kauppamerenkulku
  addVatuLayer(map, '?type=area&vaylaluokka=1,2', 'area12', 'red', 100);
  // muu vesiliikenne
  addVatuLayer(map, '?type=area&vaylaluokka=3,4,5,6', 'area3456', 'green', 20);
  addVatuLayer(map, '?type=line&vaylaluokka=1,2', 'line12', 'blue', 500);
  addVatuLayer(map, '?type=line&vaylaluokka=3,4,5,6', 'line3456', 'yellow', 50);
  // TODO: layer by restriction type (nopeusrajoitukset vs muut = erityisalueet ui:ssa???)
  addVatuLayer(map, '?type=restrictionarea&vaylaluokka=1,2,3,4,5,6', 'restrictionarea', 'purple', 20, 3);
  addPilotLayer(map);
}

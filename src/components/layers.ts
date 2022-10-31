import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Fill, Icon } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import pilot_logo from '../theme/img/pilotPlace.svg';
import quayIcon from '../theme/img/dock_icon.svg';
import quayIconActive from '../theme/img/dock_icon_active.svg';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';
// eslint-disable-next-line import/named
import { FeatureLike } from 'ol/Feature';
import { HarborFeatureProperties } from './popup/HarborPopupContent';

const url = process.env.REACT_APP_REST_API_URL ? process.env.REACT_APP_REST_API_URL + '/featureloader' : '/api/featureloader';

function addVatuLayer(map: Map, queryString: string, id: string, color: string, maxResolution: number | undefined = undefined, width = 1) {
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

export function getPilotStyle() {
  const image = new Icon({
    src: pilot_logo,
  });
  return [
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
}

function addPilotLayer(map: Map) {
  const pilotSource = new VectorSource({
    url: url + '?type=pilot',
    format: new GeoJSON({ featureProjection: 'EPSG:4326' }),
  });
  const pilotLayer = new VectorLayer({
    source: pilotSource,
    style: getPilotStyle(),
    properties: { id: 'pilot' },
    renderBuffer: 2000,
  });
  map.addLayer(pilotLayer);
}

export function getHarborStyle(feature: FeatureLike, selected: boolean) {
  const image = new Icon({
    src: quayIcon,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const activeImage = new Icon({
    src: quayIconActive,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const props = feature.getProperties() as HarborFeatureProperties;
  let text;
  // TODO: use correct language for formatting number
  if (props.name && props.draft) {
    text = `${props.name} ${props.draft?.map((d) => d.toString().replace('.', ',')).join(' m / ')} m`;
  } else if (props.draft) {
    text = `${props.draft?.map((d) => d.toString().replace('.', ',')).join(' m / ')} m`;
  } else {
    text = '';
  }
  return [
    new Style({
      image: selected ? activeImage : image,
      text: new Text({
        font: 'bold 18px "Exo 2"',
        placement: 'line',
        offsetY: -50,
        text,
        fill: new Fill({
          color: selected ? '#0064AF' : '#000000',
        }),
      }),
    }),
    new Style({
      image: new CircleStyle({
        radius: 20,
        displacement: [0, 20],
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
      }),
    }),
  ];
}

function addHarborLayer(map: Map) {
  const style = function (feature: FeatureLike) {
    return getHarborStyle(feature, false);
  };
  const harborSource = new VectorSource({
    url: url + '?type=harbor',
    format: new GeoJSON({ featureProjection: 'EPSG:4326' }),
  });
  const pilotLayer = new VectorLayer({
    source: harborSource,
    style,
    properties: { id: 'harbor' },
    maxResolution: 3,
    renderBuffer: 2000,
  });
  map.addLayer(pilotLayer);
}

export function addAPILayers(map: Map) {
  // kauppamerenkulku
  // area = Navigointialue, Satama-allas, Ohitus- ja kohtaamisalue, Kääntöallas
  addVatuLayer(map, '?type=area&vaylaluokka=1,2', 'area12', 'red', 100);
  // muu vesiliikenne
  addVatuLayer(map, '?type=area&vaylaluokka=3,4,5,6', 'area3456', 'green', 20);
  // navigointilinjat
  addVatuLayer(map, '?type=line&vaylaluokka=1,2', 'line12', '#0000FF', 500);
  addVatuLayer(map, '?type=line&vaylaluokka=3,4,5,6', 'line3456', '#0000FF', 50);
  // Nopeusrajoitus
  addVatuLayer(map, '?type=restrictionarea&vaylaluokka=1,2,3,4,5,6', 'restrictionarea', 'purple', 10, 3);
  // Ankkurointialue, Kohtaamis- ja ohittamiskieltoalue
  addVatuLayer(map, '?type=specialarea&vaylaluokka=1,2,3,4,5,6', 'specialarea', 'pink', 100, 2);
  addPilotLayer(map);
  addHarborLayer(map);
}

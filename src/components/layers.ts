import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { Icon } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
// eslint-disable-next-line import/named
import { FeatureLike } from 'ol/Feature';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import pilot_logo from '../theme/img/pilotPlace.svg';
import { Text } from '../graphql/generated';

const url = process.env.REACT_APP_REST_API_URL ? process.env.REACT_APP_REST_API_URL + '/featureloader' : '/api/featureloader';

export function addVatuLayer(map: Map) {
  const vatuSource = new VectorSource({
    url: url + '?type=line,area',
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
  });
  map.addLayer(vatuLayer);
}

export function addPilotLayer(map: Map) {
  const image = new Icon({
    src: pilot_logo,
  });
  const pilotStyleFunction = function () {
    return new Style({
      image,
    });
  };
  const pilotSource = new VectorSource({
    url: url + '?type=pilot',
    format: new GeoJSON({ featureProjection: 'EPSG:4326' }),
  });
  const pilotLayer = new VectorLayer({
    source: pilotSource,
    style: pilotStyleFunction,
  });
  map.addLayer(pilotLayer);
}

export function addAPILayers(map: Map) {
  addVatuLayer(map);
  addPilotLayer(map);
}

export type PilotProperties = {
  email?: string;
  phoneNumber?: string;
  fax?: string;
  internet?: string;
  extraInfo: Text;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addPopup(map: Map, openPopover: (event: any, place: PilotProperties) => void) {
  const element = document.getElementById('popup') as HTMLElement;
  const popup = new Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false,
  });
  map.addOverlay(popup);
  map.on('click', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (f) {
      return f;
    });
    if (!feature) {
      return;
    }
    if (feature.getProperties().type === 'pilot') {
      console.log('Feature:');
      console.dir(feature.getProperties());
      popup.setPosition(evt.coordinate);
      openPopover(evt.originalEvent, {
        email: feature.getProperties().email,
        phoneNumber: feature.getProperties().phoneNumber,
        fax: feature.getProperties().fax,
        internet: feature.getProperties().internet,
        extraInfo: {
          fi: feature.getProperties().extraInfoFI,
          sv: feature.getProperties().extraInfoSV,
          en: feature.getProperties().extraInfoEN,
        },
      });
    }
  });
}

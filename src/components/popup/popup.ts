import { SimpleGeometry } from 'ol/geom';
import Map from 'ol/Map';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { MAP } from '../../utils/constants';
import { pointerMove } from 'ol/events/condition';
import { get as getTransform } from 'ol/proj/transforms';
// eslint-disable-next-line import/named
import { FeatureLike } from 'ol/Feature';
import { getHarborStyle, getPilotStyle } from '../layers';

export function addPopup(map: Map, setPopupProperties: (properties: PopupProperties) => void) {
  const container = document.getElementById('popup') as HTMLElement;
  const content = document.getElementById('popup-content') as HTMLElement;
  const overlay = new Overlay({
    element: container,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
    positioning: 'center-left',
  });
  const types = ['pilot', 'harbor'];
  content.onclick = () => {
    overlay.setPosition(undefined);
    setPopupProperties({});
    return true;
  };
  map.addOverlay(overlay);
  map.on('singleclick', function (evt) {
    const fn = getTransform(MAP.EPSG, 'EPSG:4326');
    if (fn) {
      console.log('coordinates: ' + fn.call(map, evt.coordinate, undefined, undefined));
    }
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (f) {
      return f;
    });
    if (!feature) {
      overlay.setPosition(undefined);
      setPopupProperties({});
      return;
    }
    if (types.includes(feature.getProperties().type)) {
      const geom = (feature.getGeometry() as SimpleGeometry).clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;
      if (overlay.getPosition()) {
        overlay.setPosition(undefined);
        setPopupProperties({});
      } else {
        setPopupProperties({
          [feature.getProperties().type]: {
            coordinates: geom.getCoordinates() as number[],
            properties: feature.getProperties(),
          },
        });
        overlay.setPosition((feature.getGeometry() as SimpleGeometry).getCoordinates() as number[]);
      }
    } else {
      overlay.setPosition(undefined);
      setPopupProperties({});
    }
  });
  const style = function (feature: FeatureLike) {
    if (feature.getProperties().type === 'harbor') {
      return getHarborStyle(feature, true);
    }
    return getPilotStyle();
  };

  const pointerMoveSelect = new Select({ condition: pointerMove, style, filter: (feature) => types.includes(feature.getProperties().type) });
  pointerMoveSelect.on('select', (e) => {
    const hit = e.selected.length > 0;
    const target = map.getTarget() as HTMLElement;
    target.style.cursor = hit ? 'pointer' : '';
  });
  map.addInteraction(pointerMoveSelect);
}

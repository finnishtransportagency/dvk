import { SimpleGeometry } from 'ol/geom';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import { PopupProperties } from '../MapContainer';
import { MAP } from '../../utils/constants';

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
  });
  content.onclick = () => {
    overlay.setPosition(undefined);
    return false;
  };
  map.on('singleclick', function (evt) {
    const coordinate = evt.coordinate;
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (f) {
      return f;
    });
    if (!feature) {
      return;
    }
    if (feature.getProperties().type === 'pilot') {
      const geom = (feature.getGeometry() as SimpleGeometry).clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;
      setPopupProperties({
        pilot: {
          coordinates: geom.getCoordinates() as number[],
          name: feature.getProperties().name,
          email: feature.getProperties().email,
          phoneNumber: feature.getProperties().phoneNumber,
          fax: feature.getProperties().fax,
          internet: feature.getProperties().internet,
          journey: feature.getProperties().journey,
          extraInfo: {
            fi: feature.getProperties().extraInfoFI,
            sv: feature.getProperties().extraInfoSV,
            en: feature.getProperties().extraInfoEN,
          },
        },
      });
      overlay.setPosition(coordinate);
    }
  });
  map.addOverlay(overlay);
  map.on('pointermove', function (e) {
    const pixel = map.getEventPixel(e.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel, {
      layerFilter: (layer) => {
        return layer.getProperties().id === 'pilot';
      },
    });
    const target = map.getTarget() as HTMLElement;
    target.style.cursor = hit ? 'pointer' : '';
  });
}

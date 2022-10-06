import Map from 'ol/Map';
import { PopupProperties } from '../MapContainer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addPopup(map: Map, openPopover: (event: any, properties: PopupProperties) => void) {
  map.on('click', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (f) {
      return f;
    });
    if (!feature) {
      return;
    }
    if (feature.getProperties().type === 'pilot') {
      openPopover(evt.originalEvent, {
        pilot: {
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
    }
  });
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

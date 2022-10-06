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
      console.log('Feature:');
      console.dir(feature.getProperties());
      openPopover(evt.originalEvent, {
        pilot: {
          email: feature.getProperties().email,
          phoneNumber: feature.getProperties().phoneNumber,
          fax: feature.getProperties().fax,
          internet: feature.getProperties().internet,
          extraInfo: {
            fi: feature.getProperties().extraInfoFI,
            sv: feature.getProperties().extraInfoSV,
            en: feature.getProperties().extraInfoEN,
          },
        },
      });
    }
  });
}

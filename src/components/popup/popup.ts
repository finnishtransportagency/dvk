import { Point, SimpleGeometry } from 'ol/geom';
import Map from 'ol/Map';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { MAP } from '../../utils/constants';
import { pointerMove } from 'ol/events/condition';
// eslint-disable-next-line import/named
import { FeatureLike } from 'ol/Feature';
import { getQuayStyle, getAreaStyle, getSpecialAreaStyle, getLineStyle, getBoardLineStyle, getHarborStyle } from '../layers';
import dvkMap from '../DvkMap';
import { getPilotStyle } from '../layerStyles/pilotStyles';
import { getSafetyEquipmentStyle } from '../layerStyles/safetyEquipmentStyles';
import { getMarineWarningStyle } from '../layerStyles/marineWarningStyles';
import { getMareographStyle } from '../layerStyles/mareographStyles';
import { getObservationStyle } from '../layerStyles/observationStyles';
import { getBuoyStyle } from '../layerStyles/buoyStyles';

export function addPopup(map: Map, setPopupProperties: (properties: PopupProperties) => void) {
  const container = document.getElementById('popup') as HTMLElement;
  const content = document.getElementById('popup-content') as HTMLElement | undefined;
  const overlay = new Overlay({
    element: container,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
    positioning: 'center-left',
  });
  const types = ['pilot', 'quay', 'harbor', 'marinewarning', 'safetyequipment', 'observation', 'buoy', 'mareograph', 'line', 'area', 'specialarea'];
  if (content) {
    content.onclick = () => {
      overlay.setPosition(undefined);
      return true;
    };
  }
  map.addOverlay(overlay);
  map.on('singleclick', function (evt) {
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(
      evt.pixel,
      function (f) {
        if (types.includes(f.getProperties().featureType)) {
          features.push(f);
        }
      },
      { hitTolerance: 3 }
    );
    features.sort((a, b) => types.indexOf(a.getProperties().featureType) - types.indexOf(b.getProperties().featureType));
    const feature = features[0];
    if (!feature) {
      overlay.setPosition(undefined);
      setPopupProperties({});
      return;
    }
    const geom = (feature.getGeometry() as SimpleGeometry).clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;
    if (overlay.getPosition()) {
      overlay.setPosition(undefined);
      setPopupProperties({});
    } else {
      setPopupProperties({
        [feature.getProperties().featureType]: {
          coordinates: geom.getCoordinates() as number[],
          properties: feature.getProperties(),
        },
      });
      if (feature.getGeometry()?.getType() === 'Point') {
        overlay.setPosition((feature.getGeometry() as Point).getCoordinates());
      } else {
        overlay.setPosition(evt.coordinate);
      }
    }
  });
  const style = function (feature: FeatureLike, resolution: number) {
    const type = feature.getProperties().featureType;
    const dataSource = feature.getProperties().dataSource;
    const selected: boolean | undefined = feature.getProperties().selected;
    if (type === 'quay') {
      return getQuayStyle(feature, resolution, true);
    } else if (type === 'harbor') {
      return getHarborStyle(feature, resolution, 0, true);
    } else if (type === 'pilot') {
      return getPilotStyle(true);
    } else if (type === 'area' && dataSource === 'area12') {
      return getAreaStyle('#EC0E0E', 1, selected ? 'rgba(236,14,14,0.5)' : 'rgba(236,14,14,0.3)');
    } else if (type === 'area' && dataSource === 'area3456') {
      return getAreaStyle('#207A43', 1, selected ? 'rgba(32,122,67,0.5)' : 'rgba(32,122,67,0.3)');
    } else if (type === 'specialarea') {
      return getSpecialAreaStyle(feature, '#C57A11', 2, true, selected);
    } else if (type === 'line') {
      return getLineStyle('#0000FF', 2);
    } else if (type === 'safetyequipment') {
      return getSafetyEquipmentStyle(feature, resolution, true);
    } else if (type === 'marinewarning') {
      return getMarineWarningStyle(feature, true);
    } else if (type === 'boardline') {
      return getBoardLineStyle('#000000', 2);
    } else if (type === 'mareograph') {
      return getMareographStyle(feature, true);
    } else if (type === 'observation') {
      return getObservationStyle(true);
    } else if (type === 'buoy') {
      return getBuoyStyle(true);
    } else {
      return undefined;
    }
  };

  const pointerMoveSelect = new Select({
    condition: pointerMove,
    style,
    layers: [
      dvkMap.getFeatureLayer('pilot'),
      dvkMap.getFeatureLayer('quay'),
      dvkMap.getFeatureLayer('area12'),
      dvkMap.getFeatureLayer('area3456'),
      dvkMap.getFeatureLayer('specialarea'),
      dvkMap.getFeatureLayer('selectedfairwaycard'),
      dvkMap.getFeatureLayer('line12'),
      dvkMap.getFeatureLayer('line3456'),
      dvkMap.getFeatureLayer('safetyequipment'),
      dvkMap.getFeatureLayer('marinewarning'),
      dvkMap.getFeatureLayer('mareograph'),
      dvkMap.getFeatureLayer('observation'),
      dvkMap.getFeatureLayer('buoy'),
      dvkMap.getFeatureLayer('harbor'),
    ],
    hitTolerance: 3,
    multi: true,
  });
  pointerMoveSelect.on('select', (e) => {
    const hit = e.selected.length > 0 && e.selected.some((f) => types.includes(f.getProperties().featureType));
    const target = map.getTarget() as HTMLElement;
    target.style.cursor = hit ? 'pointer' : '';
  });
  map.addInteraction(pointerMoveSelect);
}

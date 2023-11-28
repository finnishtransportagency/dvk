import Map from 'ol/Map';
import Select from 'ol/interaction/Select';
import { FeatureLayerId } from '../../utils/constants';
import { never, pointerMove } from 'ol/events/condition';
import { getQuayStyle, getAreaStyle, getSpecialAreaStyle, getLineStyle, getBoardLineStyle, getHarborStyle } from '../layers';
import dvkMap from '../DvkMap';
import { getPilotStyle } from '../layerStyles/pilotStyles';
import { getSafetyEquipmentStyle } from '../layerStyles/safetyEquipmentStyles';
import { getMarineWarningStyle } from '../layerStyles/marineWarningStyles';
import { getMareographStyle } from '../layerStyles/mareographStyles';
import { getObservationStyle } from '../layerStyles/observationStyles';
import { getBuoyStyle } from '../layerStyles/buoyStyles';
import { getVtsStyle } from '../layerStyles/vtsStyles';
import { getCircleStyle } from '../layerStyles/circleStyles';
import { getAisVesselLayerStyle } from '../layerStyles/aisStyles';
import { FeatureLike } from 'ol/Feature';

function getLayers() {
  return [
    dvkMap.getFeatureLayer('pilot'),
    dvkMap.getFeatureLayer('quay'),
    dvkMap.getFeatureLayer('area12'),
    dvkMap.getFeatureLayer('area3456'),
    dvkMap.getFeatureLayer('specialarea2'),
    dvkMap.getFeatureLayer('specialarea15'),
    dvkMap.getFeatureLayer('selectedfairwaycard'),
    dvkMap.getFeatureLayer('line12'),
    dvkMap.getFeatureLayer('line3456'),
    dvkMap.getFeatureLayer('safetyequipment'),
    dvkMap.getFeatureLayer('safetyequipmentfault'),
    dvkMap.getFeatureLayer('coastalwarning'),
    dvkMap.getFeatureLayer('localwarning'),
    dvkMap.getFeatureLayer('boaterwarning'),
    dvkMap.getFeatureLayer('mareograph'),
    dvkMap.getFeatureLayer('observation'),
    dvkMap.getFeatureLayer('buoy'),
    dvkMap.getFeatureLayer('harbor'),
    dvkMap.getFeatureLayer('vtsline'),
    dvkMap.getFeatureLayer('vtspoint'),
    dvkMap.getFeatureLayer('aisunspecified'),
    dvkMap.getFeatureLayer('aisvesselcargo'),
    dvkMap.getFeatureLayer('aisvesselhighspeed'),
    dvkMap.getFeatureLayer('aisvesselpassenger'),
    dvkMap.getFeatureLayer('aisvesselpleasurecraft'),
    dvkMap.getFeatureLayer('aisvesseltanker'),
    dvkMap.getFeatureLayer('aisvesseltugandspecialcraft'),
  ];
}

const selectStyle = function (feature: FeatureLike, resolution: number) {
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
  } else if (type === 'specialarea2' || type === 'specialarea15') {
    return getSpecialAreaStyle(feature, '#C57A11', 2, true, selected);
  } else if (type === 'line') {
    return getLineStyle('#0000FF', 2);
  } else if (type === 'safetyequipment') {
    return getSafetyEquipmentStyle(feature, resolution, true, feature.get('faultListStyle'));
  } else if (type === 'safetyequipmentfault') {
    return getSafetyEquipmentStyle(feature, resolution, true, true);
  } else if (type === 'marinewarning') {
    return getMarineWarningStyle(feature, true);
  } else if (type === 'boardline') {
    return getBoardLineStyle('#000000', 1);
  } else if (type === 'mareograph') {
    return getMareographStyle(feature, true, resolution);
  } else if (type === 'observation') {
    return getObservationStyle(true);
  } else if (type === 'buoy') {
    return getBuoyStyle(true);
  } else if (type === 'vtsline' || type === 'vtspoint') {
    return getVtsStyle(feature, true);
  } else if (type === 'circle') {
    return getCircleStyle(feature, resolution);
  } else if (type === 'aisvessel') {
    return getAisVesselLayerStyle(dataSource as FeatureLayerId, feature, resolution, true);
  } else {
    return undefined;
  }
};

export function addPointerMoveInteraction(map: Map, types: string[]) {
  const pointerMoveSelect = new Select({
    condition: pointerMove,
    style: selectStyle,
    layers: getLayers(),
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

// Select interaction for keeping track of selected feature
export function addPointerClickInteraction(map: Map) {
  const pointerClickSelect = new Select({
    condition: never,
    style: selectStyle,
    layers: getLayers(),
    hitTolerance: 3,
  });
  pointerClickSelect.set('name', 'clickSelection');
  map.addInteraction(pointerClickSelect);
}

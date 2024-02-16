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

function getAreaStyleBySource(dataSource: FeatureLayerId, selected: boolean | undefined) {
  if (dataSource === 'area12') {
    return getAreaStyle('#EC0E0E', 1, selected ? 'rgba(236,14,14,0.5)' : 'rgba(236,14,14,0.3)');
  } else if (dataSource === 'area3456') {
    return getAreaStyle('#207A43', 1, selected ? 'rgba(32,122,67,0.5)' : 'rgba(32,122,67,0.3)');
  } else {
    return undefined;
  }
}

const selectStyle = function (feature: FeatureLike, resolution: number) {
  const type = feature.getProperties().featureType;
  const dataSource = feature.getProperties().dataSource as FeatureLayerId;
  const selected: boolean | undefined = feature.getProperties().selected;

  switch (type) {
    case 'quay':
    case 'section':
      return getQuayStyle(feature, resolution, true);
    case 'harbor':
      return getHarborStyle(feature, resolution, 0, true);
    case 'pilot':
      return getPilotStyle(true);
    case 'area':
      return getAreaStyleBySource(dataSource, selected);
    case 'specialarea2':
    case 'specialarea15':
      return getSpecialAreaStyle(feature, '#C57A11', 2, true, selected);
    case 'line':
      return getLineStyle('#0000FF', 2);
    case 'safetyequipment':
      return getSafetyEquipmentStyle(feature, resolution, true, feature.get('faultListStyle'));
    case 'safetyequipmentfault':
      return getSafetyEquipmentStyle(feature, resolution, true, true);
    case 'marinewarning':
      return getMarineWarningStyle(feature, true);
    case 'boardline':
      return getBoardLineStyle('#000000', 1);
    case 'mareograph':
      return getMareographStyle(feature, true, resolution);
    case 'observation':
      return getObservationStyle(true);
    case 'buoy':
      return getBuoyStyle(true);
    case 'vtsline':
    case 'vtspoint':
      return getVtsStyle(feature, true);
    case 'circle':
      return getCircleStyle(feature, resolution);
    case 'aisvessel':
      return getAisVesselLayerStyle(dataSource, feature, resolution, true);
    default:
      return undefined;
  }
};

export function addPointerMoveInteraction(map: Map, types: string[]) {
  const pointerMoveSelect = new Select({
    condition: pointerMove,
    style: selectStyle,
    layers: getLayers(),
    filter: (feature) => {
      return types.includes(feature.get('featureType'));
    },
    hitTolerance: 3,
    multi: true,
  });
  pointerMoveSelect.on('select', (e) => {
    const target = map.getTarget() as HTMLElement;
    target.style.cursor = e.selected.length > 0 ? 'pointer' : '';
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

export function deselectClickSelection() {
  dvkMap.olMap?.getInteractions()?.forEach((int) => {
    if (int.get('name') === 'clickSelection') {
      (int as Select).getFeatures().clear();
    }
  });
}

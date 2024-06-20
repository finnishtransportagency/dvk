import Map from 'ol/Map';
import Select from 'ol/interaction/Select';
import { FeatureLayerId } from '../../utils/constants';
import { never, pointerMove } from 'ol/events/condition';
import { getAreaStyleBySource } from '../layers';
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
import Feature, { FeatureLike } from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { getPilotRouteStyle } from '../layerStyles/pilotRouteStyles';
import { getPilotageLimitStyle } from '../layerStyles/pilotageLimitStyles';
import { getNavigationLine12Style } from '../layerStyles/navigationLine12Styles';
import { getNavigationLine3456Style } from '../layerStyles/navigationLine3456Styles';
import { getQuayStyle } from '../layerStyles/quayStyles';
import { getHarborStyle } from '../layerStyles/harborStyles';
import { getDirwayStyle } from '../layerStyles/dirwayStyles';

function getLayers() {
  return [
    dvkMap.getFeatureLayer('pilot'),
    dvkMap.getFeatureLayer('pilotagelimit'),
    dvkMap.getFeatureLayer('pilotroute'),
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
    dvkMap.getFeatureLayer('dirway'),
  ];
}

const selectStyle = function (feature: FeatureLike, resolution: number) {
  const type = feature.getProperties().featureType;
  const dataSource = feature.getProperties().dataSource as FeatureLayerId;
  const selectedFairwayCard: boolean | undefined = feature.getProperties().selected;

  switch (type) {
    case 'quay':
    case 'section':
      return getQuayStyle(feature, resolution, true);
    case 'harbor':
      return getHarborStyle(feature, resolution, true, 0);
    case 'pilot':
      return getPilotStyle(true);
    case 'pilotagelimit':
      return getPilotageLimitStyle(feature, resolution, true);
    case 'pilotroute':
      return getPilotRouteStyle(feature, resolution, true);
    case 'area':
      return getAreaStyleBySource(dataSource, true, selectedFairwayCard);
    case 'line':
      if (feature.getProperties().dataSource === 'line12') {
        return getNavigationLine12Style(feature, resolution, true);
      } else {
        return getNavigationLine3456Style(true);
      }
    case 'safetyequipment':
      return getSafetyEquipmentStyle(feature, resolution, true, feature.get('faultListStyle'));
    case 'safetyequipmentfault':
      return getSafetyEquipmentStyle(feature, resolution, true, true);
    case 'marinewarning':
      return getMarineWarningStyle(feature, true);
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
    case 'dirway':
      return getDirwayStyle(feature, resolution, true);
    default:
      return undefined;
  }
};

export function addPointerMoveInteraction(map: Map, types: string[]) {
  const pointerMoveSelect = new Select({
    condition: pointerMove,
    style: null, // Do not set style to here feature, since we have features that are in multiple layers
    layers: getLayers(),
    filter: (feature) => {
      return types.includes(feature.get('featureType'));
    },
    hitTolerance: 3,
    multi: true,
  });

  const handleSelect = (f: Feature) => {
    const type = f.getProperties().featureType;
    if (type === 'specialarea2' || type === 'specialarea15') {
      // These features are in two layers, so do not set styles to features, but set flag to indicate hover
      f.set('hoverStyle', true);
    } else {
      // Save current style so we can restore it on deselect
      f.set('savedStyle', f.getStyle(), false);
      f.setStyle(selectStyle);
    }
  };

  const handleDeselect = (f: Feature) => {
    const type = f.getProperties().featureType;
    if (type === 'specialarea2' || type === 'specialarea15') {
      // Set hoverStye flag to false only if feature has not been click-selected
      const clickInteraction = getClickSelection();
      let found = false;
      if (clickInteraction) {
        clickInteraction.getFeatures().forEach((feat) => {
          const featType = feat.getProperties().featureType;
          if ((featType === 'specialarea2' || featType === 'specialarea15') && feat.getId() === f.getId()) {
            found = true;
          }
        });
        if (!found) {
          f.set('hoverStyle', false);
        }
      }
    } else {
      // Restore old saved style to the feature
      f.setStyle(f.get('savedStyle'));
      f.unset('savedStyle', false);
    }
  };

  // Handle hover style changes in code here
  pointerMoveSelect.on('select', (e) => {
    for (const f of e.selected) {
      handleSelect(f);
    }
    for (const f of e.deselected) {
      handleDeselect(f);
    }
    const target = map.getTarget() as HTMLElement;
    target.style.cursor = e.selected.length > 0 ? 'pointer' : '';
  });
  map.addInteraction(pointerMoveSelect);
}

// Select interaction for keeping track of selected feature
export function addPointerClickInteraction(map: Map) {
  const pointerClickSelect = new Select({
    condition: never,
    style: null, // Do not set style to here feature, since we have features that are in multiple layers
    layers: getLayers(),
    hitTolerance: 3,
  });
  pointerClickSelect.set('name', 'clickSelection');
  map.addInteraction(pointerClickSelect);
}

function getClickSelection(): Select | undefined {
  let select: Select | undefined = undefined;
  dvkMap.olMap?.getInteractions()?.forEach((interaction) => {
    if (interaction.get('name') === 'clickSelection') {
      select = interaction as Select;
    }
  });
  return select;
}

// Handle click selection syle removals here
export function clearClickSelectionFeatures() {
  const interaction = getClickSelection();
  if (interaction) {
    interaction.getFeatures().forEach((f) => {
      const type = f.getProperties().featureType;
      if (type === 'specialarea2' || type === 'specialarea15') {
        f.set('hoverStyle', false);
      } else {
        // Restore old saved style to the feature
        f.setStyle(f.get('savedStyle'));
        f.unset('savedStyle', false);
      }
    });
    interaction.getFeatures().clear();
  }
}

// Handle click selection style changes here
export function setClickSelectionFeature(feature: FeatureLike) {
  const f = feature as Feature;
  const type = f.getProperties().featureType;
  if (type === 'specialarea2' || type === 'specialarea15') {
    f.set('hoverStyle', true);
  } else {
    f.set('savedStyle', f.getStyle(), false);
    f.setStyle(selectStyle);
  }

  const interaction = getClickSelection();
  if (interaction) {
    interaction.getFeatures().push(feature as Feature<Geometry>);
  }
}

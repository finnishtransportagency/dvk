import { FeatureLike } from 'ol/Feature';
import { Style, Icon } from 'ol/style';
import { AisFeatureProperties } from '../features';
import vesselCargoIcon from '../../theme/img/ais/ais_vessel_cargo.svg';
import vesselTankerIcon from '../../theme/img/ais/ais_vessel_tanker.svg';
import vesselPassengerIcon from '../../theme/img/ais/ais_vessel_passenger.svg';
import vesselHighSpeedIcon from '../../theme/img/ais/ais_vessel_high_speed.svg';
import vesselTugAndSpecialCraftIcon from '../../theme/img/ais/ais_vessel_tug_and_special_craft.svg';
import vesselFishingIcon from '../../theme/img/ais/ais_vessel_fishing.svg';
import vesselPleasureCraftIcon from '../../theme/img/ais/ais_vessel_pleasure_craft.svg';
import navigationAidEquipmentIcon from '../../theme/img/ais/ais_navigation_aid_equipment.svg';
import unspecifiedIcon from '../../theme/img/ais/ais_unspecified.svg';

function getAisVesselStyle(feature: FeatureLike, selected: boolean, imgSrc: string) {
  const props = feature.getProperties() as AisFeatureProperties;
  const scale = selected ? 1.2 : 1;
  const rotation = (props.heading * Math.PI) / 180;

  return new Style({
    image: new Icon({
      src: imgSrc,
      scale: scale,
      anchor: [0.5, 0.5],
      rotation: rotation,
    }),
  });
}

export function getAisVesselCargoStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, vesselCargoIcon);
}

export function getAisVesselTankerStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, vesselTankerIcon);
}

export function getAisVesselPassengerStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, vesselPassengerIcon);
}

export function getAisVesselHighSpeedStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, vesselHighSpeedIcon);
}

export function getAisVesselTugAndSpecialCraftStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, vesselTugAndSpecialCraftIcon);
}

export function getAisVesselFishingStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, vesselFishingIcon);
}

export function getAisVesselPleasureCraftStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, vesselPleasureCraftIcon);
}

export function getAisNavigationAidEquipmentStyle(feature: FeatureLike, selected: boolean) {
  const scale = selected ? 1.2 : 1;

  return new Style({
    image: new Icon({
      src: navigationAidEquipmentIcon,
      scale: scale,
      anchor: [0.5, 0.5],
    }),
  });
}

export function getAisUnspecifiedStyle(feature: FeatureLike, selected: boolean) {
  return getAisVesselStyle(feature, selected, unspecifiedIcon);
}

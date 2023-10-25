import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { AisFeatureProperties } from '../features';
import navigationAidEquipmentIcon from '../../theme/img/ais/ais_navigation_aid_equipment.svg';
import CircleStyle from 'ol/style/Circle';

const minVesselIconWidth = 8;
const minVesselIconHeight = 18;

function getSvgImage(vesselLength: number, vesselWidth: number, fillColor: string, strokeColor: string, resolution: number) {
  const originalIconWidth = 20;
  const originalIconHeight = 52;
  let vesselIconWidth = vesselWidth / resolution;
  let vesselIconHeight = vesselLength / resolution;

  if (vesselIconWidth < minVesselIconWidth || vesselIconHeight < minVesselIconHeight) {
    vesselIconWidth = minVesselIconWidth;
    vesselIconHeight = minVesselIconHeight;
  }

  const scaleX = vesselIconWidth / originalIconWidth;
  const scaleY = vesselIconHeight / originalIconHeight;

  const svg =
    '<svg width="' +
    vesselIconWidth +
    '" height="' +
    vesselIconHeight +
    '" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
    '<g fill="' +
    fillColor +
    '" stroke="' +
    strokeColor +
    '" transform="scale(' +
    scaleX +
    ', ' +
    scaleY +
    ')">' +
    '<path d="M9.78805302,0.5786732 C10.1680783,0.5243839 10.5688142,0.6150693 10.9001851,0.8635974 L19.5003679,12.2305079 L19.5,40.0885835 L19.502222,50.7927436 L10.8715476,42.3974797 L9.130448,42.3974797 L1.37370466,51.1249255 L0.5,12.2305109 L8.80018506,1.1635974 C9.04871319,0.8322266 9.40802777,0.6329625 9.78805302,0.5786732 Z"></path>' +
    '</g>' +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function getAisVesselStyle(feature: FeatureLike, fillColor: string, strokeColor: string, resolution: number, selected: boolean) {
  const props = feature.getProperties() as AisFeatureProperties;
  let rotation = 0;
  if (props.heading && props.heading >= 0 && props.heading < 360) {
    rotation = (props.heading * Math.PI) / 180;
  } else if (props.cog >= 0 && props.cog < 360) {
    rotation = (props.cog * Math.PI) / 180;
  }

  let iconWidth = minVesselIconWidth;
  let iconHeight = minVesselIconHeight;

  let vesselLength = 0;
  let vesselWidth = 0;
  let anchorX = 0.5;
  let anchorY = 0.5;

  if (
    props.referencePointA !== undefined &&
    props.referencePointB !== undefined &&
    props.referencePointC !== undefined &&
    props.referencePointD !== undefined
  ) {
    vesselLength = props.referencePointA + props.referencePointB;
    vesselWidth = props.referencePointC + props.referencePointD;
    iconHeight = vesselLength / resolution;
    iconWidth = vesselWidth / resolution;
    anchorX = props.referencePointC / vesselWidth;
    anchorY = props.referencePointA / vesselLength;
  }

  if (iconWidth < minVesselIconWidth || iconHeight < minVesselIconHeight) {
    iconWidth = minVesselIconWidth;
    iconHeight = minVesselIconHeight;
  }

  if (selected) {
    iconWidth += 5;
    iconHeight += 5;
  }

  const vesselStyle = new Style({
    image: new Icon({
      src: getSvgImage(vesselLength, vesselWidth, fillColor, strokeColor, resolution),
      width: iconWidth,
      height: iconHeight,
      anchorOrigin: 'top-left',
      anchor: [anchorX, anchorY],
      rotation: rotation,
      rotateWithView: true,
    }),
  });

  const aisStyle = new Style({
    image: new CircleStyle({
      radius: 2,
      fill: new Fill({ color: '#ff0000' }),
      stroke: new Stroke({ width: 1, color: '#ffffff' }),
    }),
  });

  return [vesselStyle, aisStyle];
}

export function getAisVesselCargoStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#90EE8F', '#487748', resolution, selected);
}

export function getAisVesselTankerStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#FF0000', '#880000', resolution, selected);
}

export function getAisVesselPassengerStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#0000FF', '#000088', resolution, selected);
}

export function getAisVesselHighSpeedStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#ffff00', '#888800', resolution, selected);
}

export function getAisVesselTugAndSpecialCraftStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#00ffff', '#008888', resolution, selected);
}

export function getAisVesselFishingStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#ffa07a', '#80503d', resolution, selected);
}

export function getAisVesselPleasureCraftStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#ff00ff', '#880088', resolution, selected);
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

export function getAisUnspecifiedStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#d3d3d3', '#6a6a6a', resolution, selected);
}

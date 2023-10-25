import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { AisFeatureProperties } from '../features';
import CircleStyle from 'ol/style/Circle';

const minVesselIconWidth = 8;
const minVesselIconHeight = 18;

function getSvgImage(vesselIconWidth: number, vesselIconHeight: number, fillColor: string, strokeColor: string) {
  const originalIconWidth = 20;
  const originalIconHeight = 52;
  const scaleX = vesselIconWidth / originalIconWidth;
  const scaleY = vesselIconHeight / originalIconHeight;

  const svg =
    '<svg width="' +
    vesselIconWidth +
    '" height="' +
    vesselIconHeight +
    '" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
    '<g transform="scale(' +
    scaleX +
    ', ' +
    scaleY +
    ')">' +
    '<path ' +
    'd="M0.470235118,12.3243586 L8.47423712,1.27435864 C9.10455228,0.404358637 10.2951476,0.224358637 11.1455728,0.884358637 C11.2856428,0.994358637 11.4157079,1.12435864 11.5257629,1.27435864 L19.5297649,12.3243586 L19.5297649,39.9643586 C19.5297649,39.9643586 19.5297649,50.5243586 19.5297649,50.5243586 C19.5297649,51.0643586 19.0995498,51.5143586 18.5792896,51.5143586 C18.3091546,51.5143586 18.0490245,51.3943586 17.8689345,51.1843586 L10.6253127,42.7443586 L9.39469735,42.7443586 L2.15107554,51.1843586 C2.0010005,51.3643586 1.78089045,51.4743586 1.55077539,51.5043586 L1.43071536,51.5043586 C0.900450225,51.5043586 0.48024012,51.0743586 0.48024012,50.5243586 L0.48024012,12.3243586 L0.470235118,12.3243586 Z" ' +
    'fill="' +
    fillColor +
    '"></path>' +
    '<path ' +
    'd="M18.5692846,51.9943586 C18.1590795,51.9943586 17.7688844,51.8143586 17.4987494,51.4943586 L10.3951976,43.2143586 L9.5947974,43.2143586 L2.49124562,51.4943586 C2.26113057,51.7643586 1.94097049,51.9343586 1.6008004,51.9843586 L1.46073037,51.9843586 C1.46073037,51.9843586 1.46073037,51.9943586 1.46073037,51.9943586 C0.64032016,51.9943586 0,51.3343586 0,50.5143586 L0,12.1543586 L8.08404202,0.984358637 C8.46423212,0.454358637 9.02451226,0.114358637 9.65482741,0.0243586372 C10.2851426,-0.0656413628 10.9154577,0.0943586372 11.4257129,0.494358637 C11.6058029,0.634358637 11.7658829,0.804358637 11.905953,0.984358637 L20,12.1643586 L20,50.5243586 C20,51.3443586 19.3596798,52.0043586 18.5692846,52.0043586 L18.5692846,51.9943586 Z M9.16458229,42.2343586 L10.8254127,42.2343586 L18.2191096,50.8443586 C18.4792396,51.1543586 19.0495248,50.9243586 19.0495248,50.5143586 L19.0495248,39.9543586 C19.0495248,39.9543586 19.0495248,12.4843586 19.0495248,12.4843586 L11.1355678,1.57435864 C11.0555278,1.46435864 10.9554777,1.36435864 10.8454227,1.27435864 C10.2151076,0.784358637 9.31465733,0.914358637 8.84442221,1.57435864 L0.940470235,12.4843586 L0.940470235,50.5143586 C0.940470235,50.7843586 1.15057529,51.0043586 1.42071036,51.0043586 L1.51075538,51.0043586 C1.6008004,50.9843586 1.70085043,50.9243586 1.78089045,50.8343586 L9.17458729,42.2243586 L9.16458229,42.2343586 Z" ' +
    'fill="' +
    strokeColor +
    '"></path>' +
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
  let anchorX = 0.5;
  let anchorY = 0.5;

  // Check if vessel dimensions are available
  if (
    props.referencePointA !== undefined &&
    props.referencePointB !== undefined &&
    props.referencePointC !== undefined &&
    props.referencePointD !== undefined &&
    props.referencePointB > 0 &&
    props.referencePointD > 0
  ) {
    const vesselLength = props.referencePointA + props.referencePointB;
    const vesselWidth = props.referencePointC + props.referencePointD;
    iconHeight = vesselLength / resolution;
    iconWidth = vesselWidth / resolution;
    // Reference point is available only if also A > 0 && C > 0
    if (props.referencePointA > 0 && props.referencePointC > 0) {
      anchorX = props.referencePointC / vesselWidth;
      anchorY = props.referencePointA / vesselLength;
    }
  }

  // Use minimum icon size if either width or height is below minimum
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
      src: getSvgImage(iconWidth, iconHeight, fillColor, strokeColor),
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

export function getAisVesselPleasureCraftStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#ff00ff', '#880088', resolution, selected);
}

export function getAisUnspecifiedStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, '#d3d3d3', '#6a6a6a', resolution, selected);
}

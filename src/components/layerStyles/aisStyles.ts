import Feature, { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { AisFeatureProperties } from '../features';
import CircleStyle from 'ol/style/Circle';
import { Point } from 'ol/geom';
import { MAP } from '../../utils/constants';
import * as turf from '@turf/turf';
const minVesselIconWidth = 4;
const minVesselIconHeight = 18;
const movingNavStats = [0, 3, 4, 7, 8];

function getSvgIconVesselAnchored(vesselIconWidth: number, vesselIconHeight: number, fillColor: string, strokeColor: string) {
  const originalIconWidth = 20;
  const originalIconHeight = 112;
  const scaleX = vesselIconWidth / originalIconWidth;
  const scaleY = vesselIconHeight / originalIconHeight;

  return (
    '<g transform="scale(' +
    scaleX +
    ', ' +
    scaleY +
    ')">' +
    '<path ' +
    'd="M9.99000999,24.4843586 C7.89210789,24.4843586 6.18381618,26.2543586 6.18381618,28.4443586 C6.18381618,30.6343586 7.89210789,32.4043586 9.99000999,32.4043586 C12.0879121,32.4043586 13.7962038,30.6343586 13.7962038,28.4443586 C13.7962038,26.2543586 12.0879121,24.4843586 9.99000999,24.4843586 L9.99000999,24.4843586 Z M8.47152847,1.53435864 C9.1008991,0.664358637 10.2997003,0.484358637 11.1388611,1.13435864 C11.2787213,1.24435864 11.4085914,1.38435864 11.5184815,1.53435864 L19.5104895,12.6143586 L19.5104895,109.534359 C19.5104895,110.624359 18.6613387,111.514359 17.6123876,111.514359 L2.37762238,111.514359 C1.32867133,111.514359 0.47952048,110.624359 0.47952048,109.534359 L0.47952048,12.6143586 L8.47152847,1.53435864 Z" ' +
    'fill="' +
    fillColor +
    '" ' +
    'opacity="0.5"></path>' +
    '<path ' +
    'd="M17.6023976,112.004359 L2.37762238,112.004359 C1.06893107,112.004359 0,110.894359 0,109.524359 L0,12.2243586 L8.09190809,0.994358637 C8.47152847,0.464358637 9.03096903,0.124358637 9.66033966,0.0243586372 C10.2897103,-0.0656413628 10.9190809,0.0943586372 11.4285714,0.494358637 C11.6083916,0.634358637 11.7682318,0.804358637 11.9080919,0.994358637 L20,12.2243586 L20,109.524359 C20,110.894359 18.9310689,112.004359 17.6223776,112.004359 L17.6023976,112.004359 Z M0.949050949,12.5543586 L0.949050949,109.524359 C0.949050949,110.344359 1.58841159,111.014359 2.37762238,111.014359 L17.6023976,111.014359 C18.3916084,111.014359 19.030969,110.344359 19.030969,109.524359 L19.030969,12.5543586 L11.1288711,1.59435864 C11.048951,1.48435864 10.9490509,1.38435864 10.8491508,1.29435864 C10.5394605,1.05435864 10.1698302,0.954358637 9.79020979,1.01435864 C9.41058941,1.07435864 9.08091908,1.27435864 8.85114885,1.59435864 L0.949050949,12.5543586 Z M9.99000999,33.3743586 C7.36263736,33.3743586 5.23476523,31.1543586 5.23476523,28.4343586 C5.23476523,25.7143586 7.37262737,23.4943586 9.99000999,23.4943586 C12.6073926,23.4943586 14.7452547,25.7143586 14.7452547,28.4343586 C14.7452547,31.1543586 12.6073926,33.3743586 9.99000999,33.3743586 Z M9.99000999,24.4743586 C7.89210789,24.4743586 6.18381618,26.2443586 6.18381618,28.4343586 C6.18381618,30.6243586 7.89210789,32.3943586 9.99000999,32.3943586 C12.0879121,32.3943586 13.7962038,30.6243586 13.7962038,28.4343586 C13.7962038,26.2443586 12.0879121,24.4743586 9.99000999,24.4743586 Z" ' +
    'fill="' +
    strokeColor +
    '" ></path>' +
    '</g>'
  );
}

export function getSvgIconVesselMoving(vesselIconWidth: number, vesselIconHeight: number, fillColor: string, strokeColor: string) {
  const originalIconWidth = 20;
  const originalIconHeight = 52;
  const scaleX = vesselIconWidth / originalIconWidth;
  const scaleY = vesselIconHeight / originalIconHeight;

  return (
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
    '</g>'
  );
}

function getSvgImage(vesselIconWidth: number, vesselIconHeight: number, fillColor: string, strokeColor: string, navStat: number) {
  const svgContent = movingNavStats.includes(navStat)
    ? getSvgIconVesselMoving(vesselIconWidth, vesselIconHeight, fillColor, strokeColor)
    : getSvgIconVesselAnchored(vesselIconWidth, vesselIconHeight, fillColor, strokeColor);

  const svg =
    '<svg width="' +
    vesselIconWidth +
    '" height="' +
    vesselIconHeight +
    '" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
    svgContent +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function getRotation(feature: Feature) {
  let rotation = 0;
  const props = feature.getProperties() as AisFeatureProperties;
  const geom = feature.clone().getGeometry();
  if (geom) {
    let heading = 0;
    if (props.heading && props.heading >= 0 && props.heading < 360) {
      heading = props.heading;
    } else if (props.cog >= 0 && props.cog < 360) {
      heading = props.cog;
    }
    const point = feature.getGeometry() as Point;
    const wgs84Point = geom.transform(MAP.EPSG, 'EPSG:4326') as Point;
    const turfPoint = turf.point(wgs84Point.getCoordinates());
    const turfPoint2 = turf.transformTranslate(turfPoint, 1, heading);
    const point2 = new Point(turfPoint2.geometry.coordinates);
    point2.transform('EPSG:4326', MAP.EPSG);
    const coord1 = point.getCoordinates();
    const coord2 = point2.getCoordinates();
    const angle = Math.atan2(coord2[1] - coord1[1], coord2[0] - coord1[0]);
    if (angle > Math.PI / 2) {
      rotation = 2.5 * Math.PI - angle;
    } else {
      rotation = 0.5 * Math.PI - angle;
    }
  }
  return rotation;
}

function getAisVesselStyle(feature: FeatureLike, fillColor: string, strokeColor: string, resolution: number, selected: boolean) {
  const props = feature.getProperties() as AisFeatureProperties;
  let iconWidth = minVesselIconWidth;
  let iconHeight = minVesselIconHeight;
  let anchorX = 0.5;
  let anchorY = 0.5;
  let vesselLength = 0;
  let vesselWidth = 0;

  // Check if vessel dimensions are available
  if (
    props.referencePointA !== undefined &&
    props.referencePointB !== undefined &&
    props.referencePointC !== undefined &&
    props.referencePointD !== undefined &&
    props.referencePointB > 0 &&
    props.referencePointD > 0
  ) {
    vesselLength = props.referencePointA + props.referencePointB;
    vesselWidth = props.referencePointC + props.referencePointD;
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

  let vesselStyle: Style | undefined = undefined;

  const resLimit = vesselLength > 50 ? 2 : 1;
  if (resolution < resLimit) {
    if (selected) {
      iconWidth += 2;
      iconHeight += 2;
    }
    vesselStyle = new Style({
      image: new Icon({
        src: getSvgImage(iconWidth, iconHeight, fillColor, strokeColor, props.navStat),
        width: iconWidth,
        height: iconHeight,
        anchorOrigin: 'top-left',
        anchor: [anchorX, anchorY],
        rotation: getRotation(feature as Feature),
        rotateWithView: true,
      }),
    });
  } else {
    iconWidth = vesselLength > 50 ? 10 : 8;
    iconHeight = vesselLength > 50 ? 25 : 18;
    if (selected) {
      iconWidth += 2;
      iconHeight += 2;
    }
    if (movingNavStats.includes(props.navStat)) {
      vesselStyle = new Style({
        image: new Icon({
          src: getSvgImage(iconWidth, iconHeight, fillColor, strokeColor, props.navStat),
          width: iconWidth,
          height: iconHeight,
          anchorOrigin: 'top-left',
          anchor: [anchorX, anchorY],
          rotation: getRotation(feature as Feature),
          rotateWithView: true,
        }),
      });
    } else {
      let radius = vesselLength > 50 ? 8 : 5;
      if (selected) {
        radius += 1;
      }
      vesselStyle = new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({ color: fillColor }),
          stroke: new Stroke({ width: 1, color: strokeColor }),
        }),
      });
    }
  }
  return vesselStyle;
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

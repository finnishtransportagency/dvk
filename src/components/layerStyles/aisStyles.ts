import Feature, { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { AisFeatureProperties, AisFeaturePathPredictorProperties } from '../features';
import CircleStyle from 'ol/style/Circle';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import { asArray, Color } from 'ol/color';
import { FeatureLayerId } from '../../utils/constants';
import vesselCargoIcon from '../../theme/img/ais/ais_vessel_cargo.svg';
import vesselTankerIcon from '../../theme/img/ais/ais_vessel_tanker.svg';
import vesselPassengerIcon from '../../theme/img/ais/ais_vessel_passenger.svg';
import vesselHighSpeedIcon from '../../theme/img/ais/ais_vessel_high_speed.svg';
import vesselTugAndSpecialCraftIcon from '../../theme/img/ais/ais_vessel_tug_and_special_craft.svg';
import vesselPleasureCraftIcon from '../../theme/img/ais/ais_vessel_pleasure_craft.svg';
import unspecifiedIcon from '../../theme/img/ais/ais_unspecified.svg';
import { isVesselMoving, getVesselHeading, getPointRotationAngle } from '../../utils/aisUtils';

function getSvgArrowHead(strokeColor: string) {
  const svg =
    '<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<g stroke-width="4" stroke="#ffffff">' +
    '<path d="M2 14 L8 8 L14 14" />' +
    '</g>' +
    '<g stroke-width="2" stroke="' +
    strokeColor +
    '">' +
    '<path d="M2 14 L8 8 L14 14" />' +
    '</g>' +
    '</svg>';

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* Cache arrow head icons, to avoid generating the same svg multiple times */
const arrowHeadIcons: Array<{ color: string; icon: Icon }> = [];

function getArrowHeadIcon(strokeColor: string, rotation: number | undefined) {
  let ahi = arrowHeadIcons.find((ahi) => ahi.color === strokeColor);
  if (!ahi) {
    ahi = {
      color: strokeColor,
      icon: new Icon({
        src: getSvgArrowHead(strokeColor),
        width: 16,
        height: 16,
        rotateWithView: true,
      }),
    };
    arrowHeadIcons.push(ahi);
  }
  if (rotation) {
    ahi.icon.setRotation(rotation);
  }
  return ahi.icon;
}

/* Get vessel rotation on the map */
function getRotation(feature: Feature): number | undefined {
  const props = feature.getProperties() as AisFeatureProperties;
  const heading = getVesselHeading(props.heading, props.cog);
  const geom = props.aisPoint?.clone();

  if (heading !== undefined && geom !== undefined) {
    return getPointRotationAngle(geom, heading);
  }
  return undefined;
}

interface AisVesselStyleProps {
  fillColor: string;
  strokeColor: string;
  vesselIcon: string;
}

function getRealSizeVesselStyle(feature: FeatureLike, selected: boolean, styleProps: AisVesselStyleProps) {
  const props = feature.getProperties() as AisFeatureProperties;
  const vesselStyle = new Style({
    fill: new Fill({ color: styleProps.fillColor }),
    stroke: new Stroke({ width: selected ? 2 : 1, color: styleProps.strokeColor }),
  });
  const vesselMoving = isVesselMoving(props.navStat, props.sog);
  /* Set opacity to anchored vessels */
  if (!vesselMoving) {
    const color = vesselStyle.getFill()?.getColor();
    if (color) {
      const colorArray = asArray(color as Color).slice();
      colorArray[3] = 0.5;
      vesselStyle.getFill()?.setColor(colorArray);
    }
  }
  return vesselStyle;
}

function getMovingVesselIconStyle(feature: FeatureLike, selected: boolean, styleProps: AisVesselStyleProps) {
  const props = feature.getProperties() as AisFeatureProperties;
  let geometry = feature.getGeometry() as Geometry;
  if (geometry?.getType() === 'Polygon') {
    geometry = (geometry as Polygon).getInteriorPoint();
  }
  const vesselLength = props.vesselLength ?? 0;
  let iconWidth = vesselLength > 50 ? 10 : 8;
  let iconHeight = vesselLength > 50 ? 25 : 18;
  if (selected) {
    iconWidth += 2;
    iconHeight += 2;
  }

  return new Style({
    geometry: geometry,
    image: new Icon({
      src: styleProps.vesselIcon,
      width: iconWidth,
      height: iconHeight,
      rotation: getRotation(feature as Feature),
      rotateWithView: true,
    }),
  });
}

function getAnchoredVesselIconStyle(feature: FeatureLike, selected: boolean, styleProps: AisVesselStyleProps) {
  const props = feature.getProperties() as AisFeatureProperties;
  let geometry = feature.getGeometry() as Geometry;
  if (geometry?.getType() === 'Polygon') {
    geometry = (geometry as Polygon).getInteriorPoint();
  }
  const vesselLength = props.vesselLength ?? 0;
  let radius = vesselLength > 50 ? 8 : 5;
  if (selected) {
    radius += 1;
  }
  return new Style({
    geometry: geometry,
    image: new CircleStyle({
      radius: radius,
      fill: new Fill({ color: styleProps.fillColor }),
      stroke: new Stroke({ width: 1, color: styleProps.strokeColor }),
    }),
  });
}

const pathPredictorHaloStyle = new Style({
  stroke: new Stroke({ width: 4, color: '#ffffff' }),
  zIndex: -3,
});

const pathPredictorStyle = new Style({
  stroke: new Stroke({ width: 2, lineDash: [8, 4] }),
  zIndex: -2,
});

function getPathPredictorStyles(feature: FeatureLike, color: string) {
  const geom = feature.getGeometry() as LineString;

  pathPredictorStyle.getStroke()?.setColor(color);

  const pathPredictorArrowHeadStyle = new Style({
    geometry: new Point(geom.getLastCoordinate()),
    image: getArrowHeadIcon(color, getPointRotationAngle(new Point(geom.getLastCoordinate()), feature.get('cog'))),
    zIndex: -1,
  });
  return [pathPredictorHaloStyle, pathPredictorStyle, pathPredictorArrowHeadStyle];
}

function getPathPredictorStyle(feature: FeatureLike, resolution: number, color: string) {
  const props = feature.getProperties() as AisFeaturePathPredictorProperties;
  const vesselLength = props.vesselLength ?? 0;
  const vesselWidth = props.vesselWidth ?? 0;
  const resLimit = vesselLength > 50 ? 2 : 1;
  const pathPredictorStartFromBow = resolution < resLimit && vesselWidth > 0 && vesselLength > 0;

  if (resolution < 75) {
    const realSizeVessel = feature.get('realSizeVessel');
    if ((pathPredictorStartFromBow && realSizeVessel) || (!pathPredictorStartFromBow && !realSizeVessel)) {
      return getPathPredictorStyles(feature, color);
    }
  }
  return undefined;
}

function getAisVesselStyle(feature: FeatureLike, resolution: number, selected: boolean, styleProps: AisVesselStyleProps) {
  const featureType = feature.get('featureType');

  if (featureType === 'aisvessel_pathpredictor') {
    return getPathPredictorStyle(feature, resolution, styleProps.strokeColor);
  } else {
    const props = feature.getProperties() as AisFeatureProperties;
    const vesselLength = props.vesselLength ?? 0;
    const vesselWidth = props.vesselWidth ?? 0;
    const resLimit = vesselLength > 50 ? 2 : 1;

    if (resolution < resLimit && vesselWidth > 0 && vesselLength > 0 && getVesselHeading(props.heading, props.cog) !== undefined) {
      return getRealSizeVesselStyle(feature as Feature, selected, styleProps);
    } else if (isVesselMoving(props.navStat, props.sog)) {
      return getMovingVesselIconStyle(feature as Feature, selected, styleProps);
    } else {
      return getAnchoredVesselIconStyle(feature as Feature, selected, styleProps);
    }
  }
}

export function getAisVesselLayerStyle(layerId: FeatureLayerId, feature: FeatureLike, resolution: number, selected: boolean) {
  switch (layerId) {
    case 'aisvesselpleasurecraft':
      return getAisVesselStyle(feature, resolution, selected, {
        fillColor: '#FF00FF',
        strokeColor: '#880088',
        vesselIcon: vesselPleasureCraftIcon,
      });
    case 'aisvesseltugandspecialcraft':
      return getAisVesselStyle(feature, resolution, selected, {
        fillColor: '#00FFFF',
        strokeColor: '#008888',
        vesselIcon: vesselTugAndSpecialCraftIcon,
      });
    case 'aisvesselhighspeed':
      return getAisVesselStyle(feature, resolution, selected, {
        fillColor: '#FFFF00',
        strokeColor: '#888800',
        vesselIcon: vesselHighSpeedIcon,
      });
    case 'aisvesselpassenger':
      return getAisVesselStyle(feature, resolution, selected, {
        fillColor: '#0000FF',
        strokeColor: '#000088',
        vesselIcon: vesselPassengerIcon,
      });
    case 'aisvesselcargo':
      return getAisVesselStyle(feature, resolution, selected, {
        fillColor: '#90EE8F',
        strokeColor: '#487748',
        vesselIcon: vesselCargoIcon,
      });
    case 'aisvesseltanker':
      return getAisVesselStyle(feature, resolution, selected, {
        fillColor: '#FF0000',
        strokeColor: '#880000',
        vesselIcon: vesselTankerIcon,
      });
    default:
      return getAisVesselStyle(feature, resolution, selected, {
        fillColor: '#D3D3D3',
        strokeColor: '#6A6A6A',
        vesselIcon: unspecifiedIcon,
      });
  }
}

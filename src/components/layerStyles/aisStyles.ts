import Feature, { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { AisFeatureProperties } from '../features';
import CircleStyle from 'ol/style/Circle';
import { LineString, Point, Polygon } from 'ol/geom';
import Circle from 'ol/geom/Circle';
import { fromCircle } from 'ol/geom/Polygon';
import LinearRing from 'ol/geom/LinearRing';
import { asArray, Color } from 'ol/color';
import { FeatureLayerId, MAP } from '../../utils/constants';
import transformTranslate from '@turf/transform-translate';
import { point as turf_point } from '@turf/helpers';
import vesselCargoIcon from '../../theme/img/ais/ais_vessel_cargo.svg';
import vesselTankerIcon from '../../theme/img/ais/ais_vessel_tanker.svg';
import vesselPassengerIcon from '../../theme/img/ais/ais_vessel_passenger.svg';
import vesselHighSpeedIcon from '../../theme/img/ais/ais_vessel_high_speed.svg';
import vesselTugAndSpecialCraftIcon from '../../theme/img/ais/ais_vessel_tug_and_special_craft.svg';
import vesselPleasureCraftIcon from '../../theme/img/ais/ais_vessel_pleasure_craft.svg';
import unspecifiedIcon from '../../theme/img/ais/ais_unspecified.svg';
import { Coordinate } from 'ol/coordinate';

const movingNavStats = [0, 3, 4, 7, 8];

function getSvgArrowHead(strokeColor: string) {
  const svg =
    '<svg width="16" height="16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
    '<g fill="none" stroke-width="4" stroke="' +
    '#ffffff' +
    '">' +
    '<path d="M2 14 L8 8 L14 14" />' +
    '</g>' +
    '<g fill="none" stroke-width="2" stroke="' +
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

/* Get vessel heading. If heading is missing uses cog. If heading and cog are missing returns undefined */
function getVesselHeading(feature: Feature): number | undefined {
  const props = feature.getProperties() as AisFeatureProperties;
  if (props.heading && props.heading >= 0 && props.heading < 360) {
    return props.heading;
  } else if (props.cog && props.cog >= 0 && props.cog < 360) {
    return props.cog;
  }
  return undefined;
}

/* Translate point to heading direction distance meters */
function translatePoint(point: Point, heading: number, distance: number) {
  const geom = point.clone();
  const wgs84Point = geom.transform(MAP.EPSG, 'EPSG:4326') as Point;
  const turfPoint = turf_point(wgs84Point.getCoordinates());
  // Transform given point 1km to headng direction
  const turfPoint2 = transformTranslate(turfPoint, distance / 1000, heading);
  const point2 = new Point(turfPoint2.geometry.coordinates);
  point2.transform('EPSG:4326', MAP.EPSG);
  return point2;
}

/* Get rotation angle on the map (EPSG:4326) at given point base on the wgs84 heading */
function getPointRotationAngle(point: Point, heading: number) {
  const point2 = translatePoint(point, heading, 1000);
  // calculate angle between tho points in map (EPSG:4326) coordinate system
  const coord1 = point.getCoordinates();
  const coord2 = point2.getCoordinates();
  const angle = Math.atan2(coord2[1] - coord1[1], coord2[0] - coord1[0]);
  return angle > Math.PI / 2 ? 2.5 * Math.PI - angle : 0.5 * Math.PI - angle;
}

/* Get vessel rotation on the map */
function getRotation(feature: Feature): number | undefined {
  const heading = getVesselHeading(feature);
  const geom = feature.clone().getGeometry();

  if (heading !== undefined && geom !== undefined) {
    return getPointRotationAngle(feature.getGeometry() as Point, heading);
  }
  return undefined;
}

function getCogRotation(feature: Feature): number | undefined {
  const props = feature.getProperties() as AisFeatureProperties;
  const geom = feature.clone().getGeometry();
  if (geom !== undefined && props.cog && props.cog >= 0 && props.cog < 360) {
    return getPointRotationAngle(feature.getGeometry() as Point, props.cog);
  }
  return undefined;
}

function getVesselGeometry(feature: Feature): Polygon | undefined {
  const props = feature.getProperties() as AisFeatureProperties;
  const geom = feature.getGeometry() as Point;
  const rotation = getRotation(feature);
  if (geom && rotation !== undefined && props.vesselWidth && props.vesselLength) {
    const vesselMoving = movingNavStats.includes(props.navStat);
    const polygonPoints: Array<number[]> = [];
    const coordinates = geom.getCoordinates();
    const x = coordinates[0];
    const y = coordinates[1];
    const w = props.vesselWidth;
    const h = props.vesselLength;
    const dx1 = props.referencePointC ? -props.referencePointC : 0;
    const dy1 = props.referencePointA ? props.referencePointA : 0;
    const dx2 = props.referencePointD ? props.referencePointD : 0;
    const dy2 = props.referencePointB ? -props.referencePointB : 0;

    /* Calculate vesselshaped polygon points starting from the bow clockwise */
    polygonPoints.push([x + dx1 + (dx2 - dx1) / 2, y + dy1]);
    polygonPoints.push([x + dx2, y + dy1 - h / 5]);
    polygonPoints.push([x + dx2, y + dy2]);
    if (vesselMoving) {
      polygonPoints.push([x + dx1 + (dx2 - dx1) / 2, y + dy2 + h / 5]);
    }
    polygonPoints.push([x + dx1, y + dy2]);
    polygonPoints.push([x + dx1, y + dy1 - h / 5]);

    const polygon = new Polygon([polygonPoints]);

    /* Cut circular hole to polygon if vessel is no moving */
    if (!vesselMoving) {
      const holeCenterCoord = [x + dx1 + (dx2 - dx1) / 2, y + dy1 - h / 4];
      const holePoly = fromCircle(new Circle(holeCenterCoord, w / 4));
      const c = holePoly.getCoordinates();
      polygon.appendLinearRing(new LinearRing(c[0]));
    }

    /* Rotate polygon to the rigth angle */
    polygon.rotate(-rotation, coordinates);
    return polygon;
  }
  return undefined;
}

function knotsToMetresPerSecond(x: number) {
  return (x * 1.852) / 3.6;
}

/*
Convert AIS rotation speed to degrees per second
function aisRotToDegreesPerSecond(x: number) {
  if (x < -127 || x > 127) return 0;
  const degreesPerSecond = Math.pow(x / 4.733, 2) / 60;
  console.log(x + ' : ' + degreesPerSecond);
  return x < 0 ? -degreesPerSecond : degreesPerSecond;
}
*/

function getPathPredictorGeometry(feature: Feature, startFromBow: boolean) {
  const props = feature.getProperties() as AisFeatureProperties;
  const rotation = getRotation(feature);
  const speed = knotsToMetresPerSecond(props.sog);
  let point = feature.clone().getGeometry() as Point;

  if (startFromBow) {
    /* Calculate vessel bow coordinates */
    const coordinates = point.getCoordinates();
    const x = coordinates[0];
    const y = coordinates[1];
    const dx1 = props.referencePointC ? -props.referencePointC : 0;
    const dy1 = props.referencePointA ? props.referencePointA : 0;
    const dx2 = props.referencePointD ? props.referencePointD : 0;

    const bowCoordinates = [x + dx1 + (dx2 - dx1) / 2, y + dy1];
    point = new Point(bowCoordinates);
    if (rotation !== undefined) {
      point.rotate(-rotation, coordinates);
    }
  }

  const pathCoords: Array<Coordinate> = [];
  pathCoords.push(point.getCoordinates());
  const step = 60;
  for (let i = 0; i < 360; i += step) {
    const nextPoint = translatePoint(point, props.cog, speed * step);
    pathCoords.push(nextPoint.getCoordinates());
    point = nextPoint;
  }
  return new LineString(pathCoords);
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
    geometry: getVesselGeometry(feature as Feature),
  });
  /* Set opacity to anchored vessels */
  if (!movingNavStats.includes(props.navStat)) {
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
  const vesselLength = props.vesselLength ?? 0;
  const vesselWidth = props.vesselWidth ?? 0;
  let iconWidth = vesselLength > 50 ? 10 : 8;
  let iconHeight = vesselLength > 50 ? 25 : 18;
  if (selected) {
    iconWidth += 2;
    iconHeight += 2;
  }

  return new Style({
    image: new Icon({
      src: styleProps.vesselIcon,
      width: iconWidth,
      height: iconHeight,
      anchorOrigin: 'top-left',
      anchor: [
        props.referencePointC && props.referencePointC > 0 ? props.referencePointC / vesselWidth : 0.5,
        props.referencePointA && props.referencePointA > 0 ? props.referencePointA / vesselLength : 0.5,
      ],
      rotation: getRotation(feature as Feature),
      rotateWithView: true,
    }),
  });
}

function getAnchoredVesselIconStyle(feature: FeatureLike, selected: boolean, styleProps: AisVesselStyleProps) {
  const props = feature.getProperties() as AisFeatureProperties;
  const vesselLength = props.vesselLength ?? 0;
  let radius = vesselLength > 50 ? 8 : 5;
  if (selected) {
    radius += 1;
  }
  return new Style({
    image: new CircleStyle({
      radius: radius,
      fill: new Fill({ color: styleProps.fillColor }),
      stroke: new Stroke({ width: 1, color: styleProps.strokeColor }),
    }),
  });
}

function getAisVesselStyle(feature: FeatureLike, resolution: number, selected: boolean, styleProps: AisVesselStyleProps) {
  const props = feature.getProperties() as AisFeatureProperties;
  const vesselLength = props.vesselLength ?? 0;
  const vesselWidth = props.vesselWidth ?? 0;
  const resLimit = vesselLength > 50 ? 2 : 1;
  const vesselMoving = movingNavStats.includes(props.navStat);
  let pathPredictorStartFromBow = false;
  const showPathPredictor = feature.get('showPathPredictor');

  const styles: Array<Style> = [];

  if (resolution < resLimit && vesselWidth > 0 && vesselLength > 0 && getVesselHeading(feature as Feature) !== undefined) {
    styles.push(getRealSizeVesselStyle(feature as Feature, selected, styleProps));
    pathPredictorStartFromBow = true;
  } else if (movingNavStats.includes(props.navStat)) {
    styles.push(getMovingVesselIconStyle(feature as Feature, selected, styleProps));
  } else {
    styles.push(getAnchoredVesselIconStyle(feature as Feature, selected, styleProps));
  }

  if (showPathPredictor && resolution < 75 && vesselMoving && props.sog > 0.2 && props.sog < 100) {
    const predictorLineGeom = getPathPredictorGeometry(feature as Feature, pathPredictorStartFromBow);

    const pathPredictorHaloStyle = new Style({
      stroke: new Stroke({ width: 4, color: '#ffffff' }),
      geometry: predictorLineGeom,
      zIndex: -3,
    });
    styles.push(pathPredictorHaloStyle);

    const pathPredictorStyle = new Style({
      stroke: new Stroke({ width: 2, color: styleProps.strokeColor, lineDash: [8, 4] }),
      geometry: predictorLineGeom,
      zIndex: -2,
    });
    styles.push(pathPredictorStyle);

    const pathPredictorArrowHeadStyle = new Style({
      geometry: new Point(predictorLineGeom.getLastCoordinate()),
      image: getArrowHeadIcon(styleProps.strokeColor, getCogRotation(feature as Feature)),
      zIndex: -1,
    });
    styles.push(pathPredictorArrowHeadStyle);
  }
  return styles;
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

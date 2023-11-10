import Feature, { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { AisFeatureProperties } from '../features';
import CircleStyle from 'ol/style/Circle';
import { Point, Polygon } from 'ol/geom';
import Circle from 'ol/geom/Circle';
import { fromCircle } from 'ol/geom/Polygon';
import LinearRing from 'ol/geom/LinearRing';
import { asArray, Color } from 'ol/color';
import { MAP } from '../../utils/constants';
import * as turf from '@turf/turf';
import vesselCargoIcon from '../../theme/img/ais/ais_vessel_cargo.svg';
import vesselTankerIcon from '../../theme/img/ais/ais_vessel_tanker.svg';
import vesselPassengerIcon from '../../theme/img/ais/ais_vessel_passenger.svg';
import vesselHighSpeedIcon from '../../theme/img/ais/ais_vessel_high_speed.svg';
import vesselTugAndSpecialCraftIcon from '../../theme/img/ais/ais_vessel_tug_and_special_craft.svg';
import vesselPleasureCraftIcon from '../../theme/img/ais/ais_vessel_pleasure_craft.svg';
import unspecifiedIcon from '../../theme/img/ais/ais_unspecified.svg';

const movingNavStats = [0, 3, 4, 7, 8];

function getVesselHeading(feature: Feature): number | undefined {
  const props = feature.getProperties() as AisFeatureProperties;
  if (props.heading && props.heading >= 0 && props.heading < 360) {
    return props.heading;
  } else if (props.cog && props.cog >= 0 && props.cog < 360) {
    return props.cog;
  }
  return undefined;
}

function getRotation(feature: Feature): number | undefined {
  const heading = getVesselHeading(feature);
  const geom = feature.clone().getGeometry();

  if (heading !== undefined && geom !== undefined) {
    const point = feature.getGeometry() as Point;
    const wgs84Point = geom.transform(MAP.EPSG, 'EPSG:4326') as Point;
    const turfPoint = turf.point(wgs84Point.getCoordinates());
    const turfPoint2 = turf.transformTranslate(turfPoint, 1, heading);
    const point2 = new Point(turfPoint2.geometry.coordinates);
    point2.transform('EPSG:4326', MAP.EPSG);
    const coord1 = point.getCoordinates();
    const coord2 = point2.getCoordinates();
    const angle = Math.atan2(coord2[1] - coord1[1], coord2[0] - coord1[0]);
    return angle > Math.PI / 2 ? 2.5 * Math.PI - angle : 0.5 * Math.PI - angle;
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
    const color = vesselStyle.getFill().getColor();
    if (color) {
      const colorArray = asArray(color as Color).slice();
      colorArray[3] = 0.5;
      vesselStyle.getFill().setColor(colorArray);
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

  if (resolution < resLimit && vesselWidth > 0 && vesselLength > 0 && getVesselHeading(feature as Feature) !== undefined) {
    return getRealSizeVesselStyle(feature as Feature, selected, styleProps);
  } else if (movingNavStats.includes(props.navStat)) {
    return getMovingVesselIconStyle(feature as Feature, selected, styleProps);
  } else {
    return getAnchoredVesselIconStyle(feature as Feature, selected, styleProps);
  }
}

export function getAisVesselCargoStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, resolution, selected, {
    fillColor: '#90EE8F',
    strokeColor: '#487748',
    vesselIcon: vesselCargoIcon,
  });
}

export function getAisVesselTankerStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, resolution, selected, {
    fillColor: '#FF0000',
    strokeColor: '#880000',
    vesselIcon: vesselTankerIcon,
  });
}

export function getAisVesselPassengerStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, resolution, selected, {
    fillColor: '#0000FF',
    strokeColor: '#000088',
    vesselIcon: vesselPassengerIcon,
  });
}

export function getAisVesselHighSpeedStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, resolution, selected, {
    fillColor: '#FFFF00',
    strokeColor: '#888800',
    vesselIcon: vesselHighSpeedIcon,
  });
}

export function getAisVesselTugAndSpecialCraftStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, resolution, selected, {
    fillColor: '#00FFFF',
    strokeColor: '#008888',
    vesselIcon: vesselTugAndSpecialCraftIcon,
  });
}

export function getAisVesselPleasureCraftStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, resolution, selected, {
    fillColor: '#FF00FF',
    strokeColor: '#880088',
    vesselIcon: vesselPleasureCraftIcon,
  });
}

export function getAisUnspecifiedStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  return getAisVesselStyle(feature, resolution, selected, {
    fillColor: '#D3D3D3',
    strokeColor: '#6A6A6A',
    vesselIcon: unspecifiedIcon,
  });
}

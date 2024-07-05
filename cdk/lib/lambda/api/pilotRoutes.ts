import { ALBResult } from 'aws-lambda';
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString } from 'geojson';
import { getPilotRoutesHeaders } from '../environment';
import { getFromCache, getPilotRouteCacheControlHeaders } from '../graphql/cache';
import { handleLoaderError, roundGeometry, saveResponseToS3, toBase64Response } from '../util';
import { RtzData, RtzWaypoint, Coordinate, RtzReittipiste } from './apiModels';
import { fetchPilotRoutesApi } from './axios';
import { lineString, bearingToAzimuth } from '@turf/helpers';
import { rhumbBearing as turf_rhumbBearing } from '@turf/rhumb-bearing';
import { transformTranslate as turf_transformTranslate } from '@turf/transform-translate';
import { lineIntersect as turf_lineIntersect } from '@turf/line-intersect';
import { nearestPointOnLine as turf_nearestPointOnLine } from '@turf/nearest-point-on-line';
import { lineArc as turf_lineArc } from '@turf/line-arc';

type TurningDirection = 'left' | 'right';

/* Return turning direction based on azimuths before and after turn */
function getTurningDirection(azimuthBefore: number, azimuthAfter: number): TurningDirection {
  if ((azimuthAfter > azimuthBefore && azimuthAfter - azimuthBefore < 180) || (azimuthBefore > azimuthAfter && azimuthBefore - azimuthAfter > 180)) {
    return 'right';
  }
  return 'left';
}

/* Get turning arc coordinates based on three coordinates and turning radius.
   If turning arc cannot be calculated return array of single coordinate 'middle.
*/
function getTurningArc(start: Coordinate, middle: Coordinate, end: Coordinate, turningRadius: number): Array<Coordinate> {
  /* Turning radius in kilometers, since turf library uses unit kilometers by default */
  turningRadius = turningRadius / 1000;

  /* Calculate azimuths before and after turn */
  const angle1 = bearingToAzimuth(turf_rhumbBearing(start, middle));
  const angle2 = bearingToAzimuth(turf_rhumbBearing(middle, end));

  /* Do not calculate turning arc if turning less than one degree */
  if (Math.abs(angle1 - angle2) < 1 || Math.abs(angle1 - angle2) > 359) {
    return [middle];
  }

  /* Are we turning to left or right? */
  const turningDirection = getTurningDirection(angle1, angle2);

  /* Calculate offset lines to the left or rigth side of the legs based on turning direction */
  const offsetLine1 = turf_transformTranslate(lineString([start, middle]), turningRadius, turningDirection === 'right' ? angle1 + 90 : angle1 - 90);
  const offsetLine2 = turf_transformTranslate(lineString([middle, end]), turningRadius, turningDirection === 'right' ? angle2 + 90 : angle2 - 90);

  const intersections = turf_lineIntersect(offsetLine1, offsetLine2);

  /* If not exactly one intersection point found, do not return arc */
  if (intersections.features.length !== 1) {
    return [middle];
  }

  /* Turning circle center point is the intersection point of offset lines */
  const center = intersections.features[0].geometry.coordinates;

  /* Calculate points where turning circle touches original lines */
  const touchPoint1 = turf_nearestPointOnLine(lineString([start, middle]), center);
  const touchPoint2 = turf_nearestPointOnLine(lineString([middle, end]), center);

  /* If turning circle does not touch either of original lines, do not return arc */
  if (touchPoint1 === undefined || touchPoint2 === undefined) {
    return [middle];
  }

  const touchPoint1Angle = turf_rhumbBearing(center, touchPoint1.geometry);
  const touchPoint2Angle = turf_rhumbBearing(center, touchPoint2.geometry);

  /* Do not calculate turning arc if touch point angle difference is less than one degrees */
  if (Math.abs(touchPoint1Angle - touchPoint2Angle) < 1 || Math.abs(touchPoint1Angle - touchPoint2Angle) > 359) {
    return [middle];
  }

  /* Turf lineArc always returns arc coordinates clockwise, so if we are turning left we need to reverse coordinates */
  if (turningDirection === 'right') {
    const arc = turf_lineArc(center, turningRadius, turf_rhumbBearing(center, touchPoint1.geometry), turf_rhumbBearing(center, touchPoint2.geometry));
    return arc.geometry.coordinates as Coordinate[];
  } else {
    const arc = turf_lineArc(center, turningRadius, turf_rhumbBearing(center, touchPoint2.geometry), turf_rhumbBearing(center, touchPoint1.geometry));
    const coordinates = arc.geometry.coordinates;
    coordinates.reverse();
    return coordinates as Coordinate[];
  }
}

/* Get coordinates of the whole rtz route given as RtzWaypoints */
function getRtzRoute(waypoints: Array<RtzWaypoint>): Array<Coordinate> {
  const routeCoordinates: Array<Coordinate> = [];
  if (waypoints.length > 0) {
    routeCoordinates.push(waypoints[0].coordinate);

    for (let i = 0; i < waypoints.length - 2; i++) {
      routeCoordinates.push(
        ...getTurningArc(waypoints[i].coordinate, waypoints[i + 1].coordinate, waypoints[i + 2].coordinate, waypoints[i + 1].turnRadius)
      );
    }

    if (waypoints.length > 1) {
      routeCoordinates.push(waypoints[waypoints.length - 1].coordinate);
    }
  }
  return routeCoordinates;
}

function getRouteLine(rtz: RtzData) {
  const waypoints: Array<RtzWaypoint> = [];
  const reittipisteet: Array<RtzReittipiste> = [];
  rtz.reittipisteet.forEach((rp) => {
    reittipisteet.push(rp);
  });
  reittipisteet.sort((a, b) => {
    return a.jarjestys - b.jarjestys;
  });
  reittipisteet.forEach((rp) => {
    waypoints.push({ coordinate: rp.geometria.coordinates, turnRadius: rp.kaarresade * 1852 });
  });
  const coordinates = getRtzRoute(waypoints);
  return coordinates;
}

export async function fetchPilotRouteData(): Promise<FeatureCollection> {
  const data: RtzData[] = await fetchPilotRoutesApi();
  const features: Feature<Geometry, GeoJsonProperties>[] = data
    ?.filter((entry) => entry.tila === 1)
    .map((entry) => {
      const geometry: LineString = {
        type: 'LineString',
        coordinates: getRouteLine(entry),
      };

      return {
        type: 'Feature',
        id: entry.tunnus,
        geometry: roundGeometry(geometry, 5) as LineString,
        properties: {
          featureType: 'pilotroute',
          id: entry.tunnus,
          identifier: entry.tunniste,
          name: entry.nimi,
          status: entry.tila,
          rtz: entry.rtz,
        },
      };
    });

  return {
    type: 'FeatureCollection',
    features: features,
  };
}

export async function fetchPilotRoutes(key: string): Promise<ALBResult> {
  let base64Response: string | undefined;
  let statusCode = 200;

  try {
    const pilotRouteData = await fetchPilotRouteData();
    base64Response = await toBase64Response(pilotRouteData);
  } catch (e) {
    base64Response = undefined;
    statusCode = 503;
  }

  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getPilotRoutesHeaders(),
      ...getPilotRouteCacheControlHeaders(),
    },
  };
}

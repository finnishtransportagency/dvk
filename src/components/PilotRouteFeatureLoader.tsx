import { useEffect, useState } from 'react';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { Geometry, LineString } from 'ol/geom';
import dvkMap from './DvkMap';
import { lineString, bearingToAzimuth } from '@turf/helpers';
import lineIntersect from '@turf/line-intersect';
import rhumbBearing from '@turf/rhumb-bearing';
import lineArc from '@turf/line-arc';
import transformTranslate from '@turf/transform-translate';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import { useFeatureData } from '../utils/dataLoader';
import { useDvkContext } from '../hooks/dvkContext';

type Coordinate = [number, number];

type RtzWaypoint = {
  coordinate: Coordinate;
  turnRadius: number;
};

type RtzGeometria = {
  type: string;
  coordinates: Coordinate;
};

type RtzReittipiste = {
  tunnus: number;
  nimi: string;
  rtzTunniste: number;
  reittitunnus: number;
  kaarresade: number;
  geometria: RtzGeometria;
  leveysVasen: number;
  leveysOikea: number;
  geometriaTyyppi: string;
  muutosaikaleima: string;
  jarjestys: number;
};

type RtzData = {
  tunnus: number;
  tila: number;
  nimi: string;
  tunniste: string;
  rtz: string;
  reittipisteet: Array<RtzReittipiste>;
};

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
  const angle1 = bearingToAzimuth(rhumbBearing(start, middle));
  const angle2 = bearingToAzimuth(rhumbBearing(middle, end));

  /* Do not calculate turning arc if turning less than one degree */
  if (Math.abs(angle1 - angle2) < 1 || Math.abs(angle1 - angle2) > 359) {
    return [middle];
  }

  /* Are we turning to left or right? */
  const turningDirection = getTurningDirection(angle1, angle2);

  /* Calculate offset lines to the left or rigth side of the legs based on turning direction */
  const offsetLine1 = transformTranslate(lineString([start, middle]), turningRadius, turningDirection === 'right' ? angle1 + 90 : angle1 - 90);
  const offsetLine2 = transformTranslate(lineString([middle, end]), turningRadius, turningDirection === 'right' ? angle2 + 90 : angle2 - 90);

  const intersections = lineIntersect(offsetLine1, offsetLine2);

  /* If not exactly one intersection point found, do not return arc */
  if (intersections.features.length !== 1) {
    return [middle];
  }

  /* Turning circle center point is the intersection point of offset lines */
  const center = intersections.features[0].geometry.coordinates;

  /* Calculate points where turning circle touches original lines */
  const touchPoint1 = nearestPointOnLine(lineString([start, middle]), center);
  const touchPoint2 = nearestPointOnLine(lineString([middle, end]), center);

  /* If turning circle does not touch either of original lines, do not return arc */
  if (touchPoint1 === undefined || touchPoint2 === undefined) {
    return [middle];
  }

  /* Turf lineArc always returns arc coordinates clockwise, so if we are turning left we need to reverse coordinates */
  if (turningDirection === 'right') {
    const arc = lineArc(center, turningRadius, rhumbBearing(center, touchPoint1.geometry), rhumbBearing(center, touchPoint2.geometry));
    return arc.geometry.coordinates as Coordinate[];
  } else {
    const arc = lineArc(center, turningRadius, rhumbBearing(center, touchPoint2.geometry), rhumbBearing(center, touchPoint1.geometry));
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

function usePilotRouteFeatures() {
  const { state } = useDvkContext();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(state.layers.includes('pilotroute'));
  const [pilotRouteFeatures, setPilotRouteFeatures] = useState<Feature<Geometry>[]>([]);
  const pilotRouteQuery = useFeatureData('pilotroute', true, 60 * 60 * 1000, enabled, 2 * 60 * 60 * 1000, 2 * 60 * 60 * 1000);
  const dataUpdatedAt = pilotRouteQuery.dataUpdatedAt;
  const errorUpdatedAt = pilotRouteQuery.errorUpdatedAt;
  const isPaused = pilotRouteQuery.isPaused;
  const isError = pilotRouteQuery.isError;

  useEffect(() => {
    setEnabled(state.layers.includes('pilotroute'));
  }, [state.layers]);

  useEffect(() => {
    const pilotRouteData = pilotRouteQuery.data;
    if (pilotRouteData) {
      const rtzData = pilotRouteData as unknown as RtzData[];
      const features: Feature<Geometry>[] = [];
      rtzData.forEach((rtz) => {
        const waypoints: Array<RtzWaypoint> = [];
        rtz.reittipisteet.forEach((rp) => {
          waypoints.push({ coordinate: rp.geometria.coordinates, turnRadius: rp.kaarresade * 1852 });
        });

        const routeCoordinates = getRtzRoute(waypoints);
        const routeLine = new LineString(routeCoordinates);
        routeLine.transform('EPSG:4326', MAP.EPSG);
        features.push(new Feature(routeLine));
      });
      setPilotRouteFeatures(features);
      setReady(true);
    }
  }, [pilotRouteQuery.data]);
  return { ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function usePilotRouteLayer() {
  const layerId = 'pilotroute';
  const { ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = usePilotRouteFeatures();

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(layerId);
    const source = dvkMap.getVectorSource(layerId);
    source.clear();
    pilotRouteFeatures.forEach((f) => f.set('dataSource', layerId, true));
    source.addFeatures(pilotRouteFeatures);
    layer.set('dataUpdatedAt', dataUpdatedAt);
  }, [ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, layerId]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
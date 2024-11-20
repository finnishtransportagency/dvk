import { Geometry, Point, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import * as Extent from 'ol/extent';
import { point, polygon } from '@turf/helpers';
import { pointsWithinPolygon } from '@turf/points-within-polygon';
import { buffer } from '@turf/buffer';
import { transformExtent } from 'ol/proj';

export const WGS84 = 'EPSG:4326';
export function inAreaBuffer(
  areas: Feature<Geometry>[],
  areaEPSG: string,
  bufferSizeInKm: number,
  testPoints: Feature<Geometry>[],
  pointEPSG: string
) {
  //Use a first pass to rule out easy options. This is how a spatial index works and assumes that turf libraries are not that clever
  testPoints = filterByExtent(areas, areaEPSG, testPoints, pointEPSG, bufferSizeInKm * 1000);
  const filteredPoints: Feature<Geometry>[] = [];
  const areasInLatLon = areas.map((a) => toLatLng(a, areaEPSG) as Feature<Polygon> | undefined);
  testPoints.forEach((tp) => {
    const tpAsPoint = toLatLng(tp, pointEPSG) as Feature<Point> | undefined;
    if (tpAsPoint) {
      const p = point(tpAsPoint.getGeometry()?.getCoordinates() ?? []);
      let inside = false;
      areasInLatLon.forEach((a) => {
        if (a && !inside) {
          const buff = buffer(polygon(a.getGeometry()?.getCoordinates() ?? []).geometry, bufferSizeInKm);
          if (buff && pointsWithinPolygon(p, buff).features?.length > 0) {
            filteredPoints.push(tp);
            inside = true;
          }
        }
      });
    }
  });
  return filteredPoints;
}

function toLatLng(feature: Feature<Geometry>, fromEPSG: string) {
  //Return clone to avoid changing in place
  if (fromEPSG === WGS84) {
    return feature;
  }
  const clone: Feature<Geometry> = feature?.clone();
  clone.getGeometry()?.transform(fromEPSG, WGS84);
  return clone;
}

function filterByExtent(geometries: Feature<Geometry>[], areaEPSG: string, features: Feature<Geometry>[], pointEPSG: string, bufferSizeInMetres = 0) {
  const extent = Extent.createEmpty();

  //Add all MBRs to make one large MBR
  geometries.forEach((g) => {
    const mbr = g.getGeometry()?.getExtent();
    if (mbr) {
      Extent.extend(extent, mbr);
    }
  });

  //Filter features using OL libraries
  if (!Extent.isEmpty(extent)) {
    if (bufferSizeInMetres > 0) {
      Extent.buffer(extent, bufferSizeInMetres, extent);
    }
    const wgs84extent = transformExtent(extent, areaEPSG, WGS84);

    return features.filter((f) => {
      return Extent.containsCoordinate(wgs84extent, (toLatLng(f, pointEPSG).getGeometry() as Point).getCoordinates());
    });
  }
  return features;
}

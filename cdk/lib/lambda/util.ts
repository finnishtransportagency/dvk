import { Geometry, Position } from 'geojson';

const GEOMETRY_DECIMALS = 5;

function transform(coordinates: number[], power: number) {
  for (let i = 0, ii = coordinates.length; i < ii; ++i) {
    coordinates[i] = Math.round(coordinates[i] * power) / power;
  }
  return coordinates;
}

function transformArray(coordinates: Position[], power: number) {
  for (const position of coordinates) {
    transform(position, power);
  }
}

function transformArray2(coordinates: Position[][], power: number) {
  for (const positionArray of coordinates) {
    transformArray(positionArray, power);
  }
}

function transformArray3(coordinates: Position[][][], power: number) {
  for (const positionArray of coordinates) {
    transformArray2(positionArray, power);
  }
}

export function roundGeometry(geometry: Geometry, decimals = GEOMETRY_DECIMALS) {
  const power = Math.pow(10, decimals);
  if (geometry.type === 'Point') {
    transform(geometry.coordinates, power);
  } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    transformArray(geometry.coordinates, power);
  } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
    transformArray2(geometry.coordinates, power);
  } else if (geometry.type === 'MultiPolygon') {
    transformArray3(geometry.coordinates, power);
  } else {
    for (const geom of geometry.geometries) {
      roundGeometry(geom, decimals);
    }
  }
  return geometry;
}

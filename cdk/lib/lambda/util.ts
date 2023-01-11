import { Geometry, Position } from 'geojson';

const GEOMETRY_DECIMALS = 5;
const power = Math.pow(10, GEOMETRY_DECIMALS);

function transform(coordinates: number[]) {
  for (let i = 0, ii = coordinates.length; i < ii; ++i) {
    coordinates[i] = Math.round(coordinates[i] * power) / power;
  }
  return coordinates;
}

function transformArray(coordinates: Position[]) {
  for (const position of coordinates) {
    transform(position);
  }
}

function transformArray2(coordinates: Position[][]) {
  for (const positionArray of coordinates) {
    for (const position of positionArray) {
      transform(position);
    }
  }
}

function transformArray3(coordinates: Position[][][]) {
  for (const positionArray of coordinates) {
    for (const position of positionArray) {
      for (const pos of position) {
        transform(pos);
      }
    }
  }
}

export function roundGeometry(geometry: Geometry) {
  if (geometry.type === 'Point') {
    transform(geometry.coordinates);
  } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    transformArray(geometry.coordinates);
  } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
    transformArray2(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    transformArray3(geometry.coordinates);
  } else {
    for (const geom of geometry.geometries) {
      roundGeometry(geom);
    }
  }
  return geometry;
}

import { modulo } from 'ol/math';
import { padNumber } from 'ol/string';
import { SafetyEquipmentFault } from '../graphql/generated';
import { getMap } from '../components/DvkMap';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import { FeatureCollection } from 'geojson';
import { GeoJSON } from 'ol/format';

// See degreesToStringHDMS from openlayers /src/ol/coordinate.js for reference
const degreesToStringHDM = (hemispheres: string, degrees: number, opt_fractionDigits = 0) => {
  const normalizedDegrees = modulo(degrees + 180, 360) - 180;
  const x = Math.abs(3600 * normalizedDegrees);

  let deg = Math.floor(x / 3600);
  let min = (x - deg * 3600) / 60;
  let hemisphere = '';

  if (min >= 60) {
    min = min - 60;
    deg += 1;
  }

  if (normalizedDegrees !== 0) {
    hemisphere = hemispheres.charAt(normalizedDegrees < 0 ? 1 : 0);
  }

  return deg + '\u00b0 ' + padNumber(min, 2, opt_fractionDigits).replace('.', ',') + '\u2032 ' + hemisphere;
};

export const coordinatesToStringHDM = (coords: number[] | undefined): string => {
  if (coords) {
    return degreesToStringHDM('NS', coords[1], 2) + ' / ' + degreesToStringHDM('EW', coords[0], 2);
  } else {
    return '';
  }
};

export function sortByAlign(data: SafetyEquipmentFault[]) {
  const faultSource = getMap().getVectorSource('selectedfairwaycard');
  const faultFeatures: Feature<Geometry>[] = [];
  let xMin = 0;
  let xMax = 0;
  let yMin = 0;
  let yMax = 0;
  // get max and min X and Y values
  data.forEach((fault, index) => {
    const feature = faultSource.getFeatureById(fault.equipmentId) as Feature<Geometry>;
    if (feature) {
      faultFeatures.push(feature);
      const extent = feature.getGeometry()?.getExtent();
      if (extent) {
        if (index === 0) {
          xMin = extent[0];
          xMax = extent[0];
          yMin = extent[1];
          yMax = extent[1];
        } else {
          xMin = Math.min(extent[0], xMin);
          xMax = Math.max(extent[0], xMax);
          yMin = Math.min(extent[1], yMin);
          yMax = Math.max(extent[1], yMax);
        }
      }
    }
  });
  // get differences and whichever difference is bigger and that's the fairway's aligment
  const xDifference = xMax - xMin;
  const yDifference = yMax - yMin;
  // extent[0] = x-value, extent[1] = y-value
  const aligment = Number(xDifference < yDifference);
  // sort features by defined aligment
  const sortedFaults = faultFeatures.slice().sort((a, b) => {
    const aExtent = a.getGeometry()?.getExtent();
    const bExtent = b.getGeometry()?.getExtent();
    if (aExtent && bExtent) {
      return aExtent[aligment] > bExtent[aligment] ? 1 : -1;
    }
    return 0;
  });
  // sort original array based on sorted feature array
  const finalSortedData = data.slice().sort((a, b) => {
    const indexA = sortedFaults.findIndex((f) => f.getId() === a.equipmentId);
    const indexB = sortedFaults.findIndex((f) => f.getId() === b.equipmentId);
    return indexA - indexB;
  });

  return finalSortedData;
}

export function filterFeaturesInPolygonByArea(polygons: FeatureCollection, features: SafetyEquipmentFault[] | undefined, areaFilter: string[]) {
  if (!features) {
    return [];
  }
  const format = new GeoJSON();
  const polygonFeatures = format.readFeatures(polygons);

  const lowerCaseAreaFilter = areaFilter.map((a) => a.toLocaleLowerCase());
  const filteredArray = features.filter((f) => {
    return polygonFeatures.some((p) => {
      // exception since english Saimaa name is different in polygons
      const area = p.getProperties().NIMI_EN !== 'Lake Saimaa' ? p.getProperties().NIMI_EN.toLocaleLowerCase().replace(/\s/g, '') : 'saimaa';
      const faultCoordinates = f.geometry.coordinates as Coordinate;
      return p.getGeometry()?.intersectsCoordinate(faultCoordinates) && lowerCaseAreaFilter.includes(area);
    });
  });
  return filteredArray;
}

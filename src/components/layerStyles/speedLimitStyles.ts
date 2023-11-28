import { Fill, Icon, Style, Text } from 'ol/style';
import Feature, { FeatureLike } from 'ol/Feature';
import { getMap } from '../DvkMap';
import speedLimitIcon from '../../theme/img/rajoitus_pohja.svg';
import { Geometry, MultiPolygon, Polygon } from 'ol/geom';
import intersect from '@turf/intersect';
import flatten from '@turf/flatten';
import { polygon } from '@turf/helpers';
import { Polygon as turf_Polygon } from 'geojson';
import { getTopLeft, getBottomRight } from 'ol/extent';
import { GeoJSON } from 'ol/format';

const speedLimitImage = new Image();
speedLimitImage.src = speedLimitIcon;
const format = new GeoJSON();

const fillStyle = new Style({
  fill: new Fill({
    color: 'rgba(255,195,0,0.5)',
  }),
});

const labelStyle = new Style({
  zIndex: 100,
  image: new Icon({
    src: speedLimitIcon,
    anchor: [0.5, 12],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 1,
  }),
  text: new Text({
    font: 'bold 12px "Exo2"',
    placement: 'point',
    fill: new Fill({
      color: '#000000',
    }),
  }),
});

export function getSpeedLimitStyle(feature: FeatureLike) {
  const speedLimit = feature.get('speedLimit');
  labelStyle.getText()?.setText('' + speedLimit);

  let fillColor = 'rgba(0,0,0,0)';
  if (speedLimit > 0 && speedLimit <= 5) {
    fillColor = 'rgba(145,10,163,0.5)';
  } else if (speedLimit > 5 && speedLimit <= 10) {
    fillColor = 'rgba(199,63,0,0.5)';
  } else if (speedLimit > 10 && speedLimit <= 15) {
    fillColor = 'rgba(255,81,0,0.5)';
  } else if (speedLimit > 15 && speedLimit <= 20) {
    fillColor = 'rgba(255,195,0,0.5)';
  } else if (speedLimit > 20 && speedLimit <= 25) {
    fillColor = 'rgba(141,203,109,0.5)';
  } else if (speedLimit > 25) {
    fillColor = 'rgba(0,176,204,0.5)';
  }

  fillStyle.getFill()?.setColor(fillColor);

  const dvkMap = getMap();
  const bbox = dvkMap.olMap?.getView().calculateExtent();

  if (bbox) {
    const topLeft = getTopLeft(bbox);
    const bottomRight = getBottomRight(bbox);
    const turfBBoxPolygon = polygon([
      [
        [topLeft[0], topLeft[1]],
        [bottomRight[0], topLeft[1]],
        [bottomRight[0], bottomRight[1]],
        [topLeft[0], bottomRight[1]],
        [topLeft[0], topLeft[1]],
      ],
    ]);
    const geomPoly = format.writeGeometryObject(feature.getGeometry() as Geometry);
    const intersected = intersect(geomPoly as turf_Polygon, turfBBoxPolygon.geometry);

    if (intersected) {
      const flattened = flatten(intersected);
      const multiPolygon = new MultiPolygon([]);
      for (const fg of flattened.features) {
        const geom = (format.readFeature(fg) as Feature<Geometry>).getGeometry() as Polygon;
        multiPolygon.appendPolygon(geom);
      }
      labelStyle.setGeometry(multiPolygon.getInteriorPoints());
      return [fillStyle, labelStyle];
    }
  }
  return [fillStyle];
}

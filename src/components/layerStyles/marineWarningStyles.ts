import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { LineString, Point, Polygon } from 'ol/geom';
import marinearea from '../../theme/img/merivaroitus_tausta.svg';
import marineareaSelected from '../../theme/img/merivaroitus_tausta_valittu.svg';
import marine from '../../theme/img/merivaroitus_ikoni.svg';
import { isCoastalWarning } from '../../utils/common';
import { MarineWarningFeatureProperties } from '../features';

const marineAreaImage = new Image();
marineAreaImage.src = marinearea;

const marineAreaSelectedImage = new Image();
marineAreaSelectedImage.src = marineareaSelected;

export function getMarineWarningStyle(feature: FeatureLike, selected: boolean) {
  const featureProperties = feature.getProperties() as MarineWarningFeatureProperties;
  const selectedScale = selected ? 1.2 : 1;
  const iconScale = isCoastalWarning(featureProperties.type) ? 1.5 * selectedScale : 1 * selectedScale;

  if (feature.getGeometry()?.getType() === 'Polygon') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const gradient = context.createPattern(selected ? marineAreaSelectedImage : marineAreaImage, 'repeat');

    return [
      new Style({
        stroke: new Stroke({
          color: '#EC0E0E',
          width: 2,
        }),
        fill: new Fill({
          color: gradient,
        }),
      }),
      new Style({
        image: new Icon({
          src: marine,
          opacity: 1,
          scale: iconScale,
        }),
        geometry: function (feat) {
          const geometry = feat.getGeometry() as Polygon;
          return geometry.getInteriorPoint();
        },
      }),
    ];
  } else if (feature.getGeometry()?.getType() === 'Point') {
    return [
      new Style({
        image: new Icon({
          src: marine,
          opacity: 1,
          anchor: [0.5, 28],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          scale: iconScale,
        }),
      }),
    ];
  } else {
    return [
      new Style({
        stroke: new Stroke({
          color: '#EC0E0E',
          width: 2,
        }),
      }),
      new Style({
        image: new Icon({
          src: marine,
          opacity: 1,
          scale: iconScale,
        }),
        geometry: function (feat) {
          const geometry = feat.getGeometry() as LineString;
          return new Point(geometry.getFlatMidpoint());
        },
      }),
    ];
  }
}

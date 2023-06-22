import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { LineString, Point, Polygon } from 'ol/geom';
import marinearea from '../../../theme/img/merivaroitus_tausta.svg';
import marineareaSelected from '../../../theme/img/merivaroitus_tausta_valittu.svg';
import marine from '../../../theme/img/merivaroitus_ikoni.svg';

const marineAreaImage = new Image();
marineAreaImage.src = marinearea;

const marineAreaSelectedImage = new Image();
marineAreaSelectedImage.src = marineareaSelected;

export function getMarineWarningStyle(feature: FeatureLike, selected: boolean) {
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
          scale: selected ? 1.2 : 1,
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
          scale: selected ? 1.2 : 1,
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
          scale: selected ? 1.2 : 1,
        }),
        geometry: function (feat) {
          const geometry = feat.getGeometry() as LineString;
          return new Point(geometry.getFlatMidpoint());
        },
      }),
    ];
  }
}

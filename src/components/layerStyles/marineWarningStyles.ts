import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { LineString, Point, Polygon } from 'ol/geom';
import marinearea from '../../theme/img/merivaroitus_tausta.svg';
import marineareaSelected from '../../theme/img/merivaroitus_tausta_valittu.svg';
import coastal from '../../theme/img/coastal_warning_icon.svg';
import local from '../../theme/img/local_warning_icon.svg';
import boaters from '../../theme/img/warning_to_boaters_icon.svg';
import { isGeneralMarineWarning } from '../../utils/common';
import { MarineWarningFeatureProperties } from '../features';
import { Maybe } from '../../graphql/generated';

const marineAreaImage = new Image();
marineAreaImage.src = marinearea;

const marineAreaSelectedImage = new Image();
marineAreaSelectedImage.src = marineareaSelected;

function getImgSource(type: Maybe<string> | undefined) {
  switch (type) {
    case 'LOCAL WARNING':
      return local;
    case 'COASTAL WARNING':
      return coastal;
    case 'VAROITUKSIA VENEILIJÖILLE':
      return boaters;
    default:
      return coastal;
  }
}

export function getMarineWarningStyle(feature: FeatureLike, selected: boolean) {
  const featureProperties = feature.getProperties() as MarineWarningFeatureProperties;
  const { dataSource, type } = featureProperties;
  const selectedScale = selected ? 1.2 : 1;
  const iconScale = isGeneralMarineWarning(featureProperties.area) ? 1.5 * selectedScale : 1 * selectedScale;

  if (
    (dataSource === 'coastalwarning' && type?.fi !== 'COASTAL WARNING') ||
    (dataSource === 'localwarning' && type?.fi !== 'LOCAL WARNING') ||
    (dataSource === 'boaterwarning' && type?.fi !== 'VAROITUKSIA VENEILIJÖILLE')
  ) {
    return undefined;
  }

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
          src: getImgSource(type?.fi),
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
          src: getImgSource(type?.fi),
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
          src: getImgSource(type?.fi),
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

import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import { LineString, Point, Polygon } from 'ol/geom';
import marinearea from '../../theme/img/merivaroitus_tausta.svg';
import marineareaSelected from '../../theme/img/merivaroitus_tausta_valittu.svg';
import { isGeneralMarineWarning, getWarningImgSource } from '../../utils/common';
import { MarineWarningFeatureProperties } from '../features';

const marineAreaImage = new Image();
marineAreaImage.src = marinearea;
let areaStyle: Style | undefined = undefined;

const marineAreaSelectedImage = new Image();
marineAreaSelectedImage.src = marineareaSelected;
let selectedAreaStyle: Style | undefined = undefined;

function getAreaStyle(selected: boolean) {
  let s = selected ? selectedAreaStyle : areaStyle;
  if (!s) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const gradient = context.createPattern(selected ? marineAreaSelectedImage : marineAreaImage, 'repeat');
    s = new Style({
      stroke: new Stroke({
        color: '#EC0E0E',
        width: 2,
      }),
      fill: new Fill({
        color: gradient,
      }),
      zIndex: 1,
    });
    if (selected) {
      selectedAreaStyle = s;
    } else {
      areaStyle = s;
    }
  }
  return s;
}

export function getMarineWarningStyle(feature: FeatureLike, selected: boolean) {
  const featureProperties = feature.getProperties() as MarineWarningFeatureProperties;
  const selectedScale = selected ? 1.2 : 1;
  const iconScale = isGeneralMarineWarning(featureProperties.area) ? 1.5 * selectedScale : 1 * selectedScale;

  if (feature.getGeometry()?.getType() === 'Polygon') {
    return [
      getAreaStyle(selected),
      new Style({
        image: new Icon({
          src: getWarningImgSource(featureProperties.type?.fi ?? ''),
          opacity: 1,
          anchor: [0.5, 28],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          scale: iconScale,
        }),
        geometry: function (feat) {
          const geometry = feat.getGeometry() as Polygon;
          return geometry.getInteriorPoint();
        },
        zIndex: 2,
      }),
    ];
  } else if (feature.getGeometry()?.getType() === 'Point') {
    return [
      new Style({
        image: new Icon({
          src: getWarningImgSource(featureProperties.type?.fi ?? ''),
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
        zIndex: 1,
      }),
      new Style({
        image: new Icon({
          src: getWarningImgSource(featureProperties.type?.fi ?? ''),
          opacity: 1,
          anchor: [0.5, 28],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          scale: iconScale,
        }),
        geometry: function (feat) {
          const geometry = feat.getGeometry() as LineString;
          return new Point(geometry.getFlatMidpoint());
        },
        zIndex: 2,
      }),
    ];
  }
}

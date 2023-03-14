import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import vtsIcon from '../../theme/img/vts_ilmoituspiste_ikoni.svg';
import { VtsFeatureProperties } from '../features';

let pointStyle: Style[] | undefined = undefined;
let selectedPointStyle: Style[] | undefined = undefined;
let lineStyle: Style | undefined = undefined;
let selectedLineStyle: Style | undefined = undefined;

export function getVtsStyle(feature: FeatureLike, selected: boolean) {
  let s;
  const props = feature.getProperties() as VtsFeatureProperties;
  if (props.featureType === 'vtspoint') {
    s = selected ? selectedPointStyle : pointStyle;
  } else {
    s = selected ? selectedLineStyle : lineStyle;
  }
  if (!s) {
    if (props.featureType === 'vtspoint') {
      if (selected) {
        s = selectedPointStyle = [
          new Style({
            image: new Icon({
              src: vtsIcon,
              scale: 1.2,
              anchor: [0.5, 0.5],
            }),
          }),
          new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({
                color: 'rgba(0,0,0,0)',
              }),
            }),
          }),
        ];
      } else {
        s = pointStyle = [
          new Style({
            image: new Icon({
              src: vtsIcon,
              scale: 1,
              anchor: [0.5, 0.5],
            }),
          }),
          new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({
                color: 'rgba(0,0,0,0)',
              }),
            }),
          }),
        ];
      }
    } else {
      if (selected) {
        s = selectedLineStyle = new Style({
          stroke: new Stroke({
            color: '#ff00ff',
            width: 2,
            lineDash: [15, 10],
          }),
        });
      } else {
        s = lineStyle = new Style({
          stroke: new Stroke({
            color: '#ff00ff',
            width: 1,
            lineDash: [15, 10],
          }),
        });
      }
    }
  }
  return s;
}

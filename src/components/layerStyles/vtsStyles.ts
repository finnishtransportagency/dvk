import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Fill, Stroke } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import vtsIcon from '../../theme/img/vts_ilmoituspiste_ikoni.svg';
import { VtsFeatureProperties } from '../features';

let pointStyle: Style[] | undefined = undefined;
let selectedPointStyle: Style[] | undefined = undefined;
let lineStyle: Style | undefined = undefined;
let selectedLineStyle: Style | undefined = undefined;

function getVtsPointStyle(selected: boolean) {
  let s = selected ? selectedPointStyle : pointStyle;
  if (!s) {
    s = [
      new Style({
        image: new Icon({
          src: vtsIcon,
          scale: selected ? 1.2 : 1,
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
    if (selected) {
      selectedPointStyle = s;
    } else {
      pointStyle = s;
    }
  }
  return s;
}

function getVtsLineStyle(selected: boolean) {
  let s = selected ? selectedLineStyle : lineStyle;
  if (!s) {
    s = new Style({
      stroke: new Stroke({
        color: '#ff00ff',
        width: selected ? 2 : 1,
        lineDash: [15, 10],
      }),
    });
    if (selected) {
      selectedLineStyle = s;
    } else {
      lineStyle = s;
    }
  }
  return s;
}

export function getVtsStyle(feature: FeatureLike, selected: boolean) {
  const props = feature.getProperties() as VtsFeatureProperties;
  return props.featureType === 'vtspoint' ? getVtsPointStyle(selected) : getVtsLineStyle(selected);
}

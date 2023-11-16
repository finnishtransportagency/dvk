import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Text, Fill } from 'ol/style';
import mareographIcon from '../../theme/img/vedenkorkeus_pohja.svg';
import mareographIcon2 from '../../theme/img/laskennallinen_vedenkorkeus_pohja.svg';
import { MareographFeatureProperties } from '../features';

let style: Style | undefined = undefined;
let selectedStyle: Style | undefined = undefined;
let calculatedStyle: Style | undefined = undefined;
let calculatedSelectedStyle: Style | undefined = undefined;

function getSelectedStyle(icon: string, offsetX: number, offsetY: number) {
  return new Style({
    image: new Icon({
      src: icon,
      scale: 1.2,
      anchor: [14, 32],
      anchorXUnits: 'pixels',
      anchorYUnits: 'pixels',
    }),
    text: new Text({
      font: 'bold 12px "Exo2"',
      placement: 'line',
      offsetX,
      offsetY,
      text: '',
      fill: new Fill({
        color: '#000000',
      }),
    }),
  });
}

function getStyle(icon: string, offsetX: number, offsetY: number) {
  return new Style({
    image: new Icon({
      src: icon,
      scale: 1,
      anchor: [14, 32],
      anchorXUnits: 'pixels',
      anchorYUnits: 'pixels',
    }),
    text: new Text({
      font: 'bold 11px "Exo2"',
      placement: 'line',
      offsetX,
      offsetY,
      text: '',
      fill: new Fill({
        color: '#000000',
      }),
    }),
  });
}

export function getMareographStyle(feature: FeatureLike, selected: boolean, resolution: number) {
  const props = feature.getProperties() as MareographFeatureProperties;
  if (props.calculated && resolution > 150) {
    return undefined;
  }
  let s;
  if (props.calculated) {
    s = selected ? calculatedSelectedStyle : calculatedStyle;
    if (!s) {
      if (selected) {
        s = calculatedSelectedStyle = getSelectedStyle(mareographIcon2, 42, -23);
      } else {
        s = calculatedStyle = getStyle(mareographIcon2, 40, -19);
      }
    }
  } else {
    s = selected ? selectedStyle : style;
    if (!s) {
      if (selected) {
        s = selectedStyle = getSelectedStyle(mareographIcon, 44, -20);
      } else {
        s = style = getStyle(mareographIcon, 42, -16);
      }
    }
  }
  s.getText()?.setText(`${Math.round(props.waterLevel / 10)}/${Math.round(props.n2000WaterLevel / 10)} cm`);
  return s;
}

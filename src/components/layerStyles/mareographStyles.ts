import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Text, Fill } from 'ol/style';
import mareographIcon from '../../theme/img/vedenkorkeus_pohja.svg';
import mareographIcon2 from '../../theme/img/laskennallinen_vedenkorkeus_pohja.svg';
import { MareographFeatureProperties } from '../features';
import mareographRedIcon from '../../theme/img/vedenkorkeus_pohja_red.svg';
import mareographRedIcon2 from '../../theme/img/laskennallinen_vedenkorkeus_pohja_red.svg';
import { getTimeDifference } from '../../utils/common';

let style: Style | undefined = undefined;
let selectedStyle: Style | undefined = undefined;
let calculatedStyle: Style | undefined = undefined;
let calculatedSelectedStyle: Style | undefined = undefined;

const hourInMilliseconds = 3600000;

function getSelectedStyle(icon: string, offsetX: number, offsetY: number, isOutdatedData: boolean) {
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
        color: isOutdatedData ? '#EC0E0E' : '#000000',
      }),
    }),
  });
}

function getStyle(icon: string, offsetX: number, offsetY: number, isOutdatedData: boolean) {
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
        color: isOutdatedData ? '#EC0E0E' : '#000000',
      }),
    }),
  });
}

function getCalculatedStyle(selected: boolean, isOutdatedData: boolean) {
  let s = selected ? calculatedSelectedStyle : calculatedStyle;
  const icon = isOutdatedData ? mareographRedIcon2 : mareographIcon2;
  if (!s) {
    if (selected) {
      s = calculatedSelectedStyle = getSelectedStyle(icon, 44, -20, isOutdatedData);
    } else {
      s = calculatedStyle = getStyle(icon, 42, -16, isOutdatedData);
    }
  }
  return s;
}

function getMeasuredStyle(selected: boolean, isOutdatedData: boolean) {
  let s = selected ? selectedStyle : style;
  const icon = isOutdatedData ? mareographRedIcon : mareographIcon;
  if (!s) {
    if (selected) {
      s = selectedStyle = getSelectedStyle(icon, 44, -20, isOutdatedData);
    } else {
      s = style = getStyle(icon, 42, -16, isOutdatedData);
    }
  }
  return s;
}

export function getMareographStyle(feature: FeatureLike, selected: boolean, resolution: number) {
  const props = feature.getProperties() as MareographFeatureProperties;
  const isOutdatedData = getTimeDifference(props.dateTime) > hourInMilliseconds * 12;
  if (props.calculated && resolution > 150) {
    return undefined;
  }

  const s = props.calculated ? getCalculatedStyle(selected, isOutdatedData) : getMeasuredStyle(selected, isOutdatedData);
  const basicText = `${Math.round(props.waterLevel / 10)}/${Math.round(props.n2000WaterLevel / 10)} cm`;
  const outDatedText = '-/- cm';
  s.getText()?.setText(isOutdatedData ? outDatedText : basicText);
  return s;
}

import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Text, Fill } from 'ol/style';
import mareographIcon from '../../theme/img/vedenkorkeus_pohja.svg';
import mareographIcon2 from '../../theme/img/laskennallinen_vedenkorkeus_pohja.svg';
import mareographRedIconWithValues from '../../theme/img/vedenkorkeus_pohja_red_yli_tunti.svg';
import { MareographFeatureProperties } from '../features';
import mareographRedIcon from '../../theme/img/vedenkorkeus_pohja_red.svg';
import mareographRedIcon2 from '../../theme/img/laskennallinen_vedenkorkeus_pohja_red.svg';
import mareographRedIconWithValues2 from '../../theme/img/laskennallinen_vedenkorkeus_pohja_yli_tunti.svg';
import { getTimeDifference } from '../../utils/common';
import { hourInMilliseconds } from '../../utils/constants';

let style: Style | undefined = undefined;
let selectedStyle: Style | undefined = undefined;
let calculatedStyle: Style | undefined = undefined;
let calculatedSelectedStyle: Style | undefined = undefined;

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

function getIcon(timeDifference: number, calculated: boolean) {
  if (timeDifference > hourInMilliseconds * 12) {
    return calculated ? mareographRedIcon2 : mareographRedIcon;
  } else if (timeDifference > hourInMilliseconds) {
    return calculated ? mareographRedIconWithValues2 : mareographRedIconWithValues;
  } else {
    return calculated ? mareographIcon2 : mareographIcon;
  }
}

function getCalculatedStyle(selected: boolean, timeDifference: number) {
  let s = selected ? calculatedSelectedStyle : calculatedStyle;
  const isOutdatedData = timeDifference > hourInMilliseconds;
  const icon = getIcon(timeDifference, true);
  const selectedOffsetX = timeDifference > hourInMilliseconds * 12 ? 36 : 44;
  const offsetX = timeDifference > hourInMilliseconds * 12 ? 34 : 42;

  if (!s) {
    if (selected) {
      s = calculatedSelectedStyle = getSelectedStyle(icon, selectedOffsetX, -20, isOutdatedData);
    } else {
      s = calculatedStyle = getStyle(icon, offsetX, -16, isOutdatedData);
    }
  }
  return s;
}

function getMeasuredStyle(selected: boolean, timeDifference: number) {
  let s = selected ? selectedStyle : style;
  const isOutdatedData = timeDifference > hourInMilliseconds;
  const icon = getIcon(timeDifference, false);
  const selectedOffsetX = timeDifference > hourInMilliseconds * 12 ? 36 : 44;
  const offsetX = timeDifference > hourInMilliseconds * 12 ? 34 : 42;

  if (!s) {
    if (selected) {
      s = selectedStyle = getSelectedStyle(icon, selectedOffsetX, -20, isOutdatedData);
    } else {
      s = style = getStyle(icon, offsetX, -16, isOutdatedData);
    }
  }
  return s;
}

export function getMareographStyle(feature: FeatureLike, selected: boolean, resolution: number) {
  const props = feature.getProperties() as MareographFeatureProperties;
  const timeDifference = getTimeDifference(props.dateTime);
  if (props.calculated && resolution > 150) {
    return undefined;
  }

  const s = props.calculated ? getCalculatedStyle(selected, timeDifference) : getMeasuredStyle(selected, timeDifference);
  const basicText = `${Math.round(props.waterLevel / 10)}/${Math.round(props.n2000WaterLevel / 10)}cm`;
  const outDatedText = '-/-cm';
  s.getText()?.setText(timeDifference > hourInMilliseconds * 12 ? outDatedText : basicText);
  return s;
}

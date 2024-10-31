import { Style, Icon } from 'ol/style';
import forecastIcon from '../../theme/img/saa_ja_aalto_ennuste.svg';
import { FeatureLike } from 'ol/Feature';

const style = new Style({
  image: new Icon({
    src: forecastIcon,
    scale: 1,
    anchor: [0.5, 32],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
});

const hoverStyle = new Style({
  image: new Icon({
    src: forecastIcon,
    scale: 1.2,
    anchor: [0.5, 32],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
});

export function getForecastStyle(feature: FeatureLike) {
  const selected = !!feature.get('selected');
  const hovered = !!feature.get('hoverStyle');
  if (selected) {
    return undefined;
  }
  return hovered ? hoverStyle : style;
}

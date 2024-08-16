import { FeatureLike } from 'ol/Feature';
import { Style, Text, Fill, Stroke, Icon } from 'ol/style';
import { getMap } from '../DvkMap';
import { Lang } from '../../utils/constants';
import quayIcon from '../../theme/img/dock_icon.svg';
import quayIconActive from '../../theme/img/dock_icon_active.svg';
import restrictionIcon from '../../theme/img/restriction_port.svg';
import restrictionIconActive from '../../theme/img/restriction_port_active.svg';
import { HarborFeatureProperties } from '../features';

const style = new Style({
  image: new Icon({
    src: quayIcon,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  text: new Text({
    font: `bold 13px "Exo2"`,
    placement: 'line',
    offsetY: -55,
    text: '',
    fill: new Fill({
      color: '#000000',
    }),
    stroke: new Stroke({
      width: 3,
      color: '#ffffff',
    }),
  }),
  zIndex: 1,
});

const selectedStyle = new Style({
  image: new Icon({
    src: quayIconActive,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  text: new Text({
    font: `bold 13px "Exo2"`,
    placement: 'line',
    offsetY: -55,
    text: '',
    fill: new Fill({
      color: '#0064AF',
    }),
    stroke: new Stroke({
      width: 3,
      color: '#ffffff',
    }),
  }),
  zIndex: 10,
});

export function getHarborStyle(feature: FeatureLike, resolution: number, selected = false, minResolution = 0) {
  if (minResolution && resolution < minResolution) {
    return undefined;
  }

  const props = feature.getProperties() as HarborFeatureProperties;
  const dvkMap = getMap();
  const text = props.name ? (props.name[dvkMap.i18n.resolvedLanguage as Lang] as string) : '';

  const s = selected ? selectedStyle : style;
  s.getText()?.setFont(`bold ${resolution < 50 ? '18' : '13'}px "Exo2"`);
  s.getText()?.setText(text);
  return s;
}

const restrictionStyle = new Style({
  image: new Icon({
    src: restrictionIcon,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  zIndex: 1,
});

const selectedRestrictionStyle = new Style({
  image: new Icon({
    src: restrictionIconActive,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  zIndex: 10,
});

export function getRestrictionPortStyle(selected = false) {
  return selected ? selectedRestrictionStyle : restrictionStyle;
}

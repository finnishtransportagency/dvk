import { FeatureLike } from 'ol/Feature';
import { Style, Text, Fill, Stroke, Icon } from 'ol/style';
import { getMap } from '../DvkMap';
import { Lang } from '../../utils/constants';
import quayIcon from '../../theme/img/dock_icon.svg';
import quayIconActive from '../../theme/img/dock_icon_active.svg';
import { HarborFeatureProperties } from '../features';

export function getHarborStyle(feature: FeatureLike, resolution: number, selected = false, minResolution = 0) {
  if (minResolution && resolution < minResolution) {
    return undefined;
  }

  const image = new Icon({
    src: quayIcon,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const activeImage = new Icon({
    src: quayIconActive,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const props = feature.getProperties() as HarborFeatureProperties;
  let text;
  const dvkMap = getMap();
  if (props.name) {
    text = props.name[dvkMap.i18n.resolvedLanguage as Lang] as string;
  } else {
    text = '';
  }
  return new Style({
    image: selected ? activeImage : image,
    text: new Text({
      font: `bold ${resolution < 50 ? '18' : '13'}px "Exo2"`,
      placement: 'line',
      offsetY: -55,
      text,
      fill: new Fill({
        color: selected ? '#0064AF' : '#000000',
      }),
      stroke: new Stroke({
        width: 3,
        color: '#ffffff',
      }),
    }),
    zIndex: selected ? 10 : 1,
  });
}

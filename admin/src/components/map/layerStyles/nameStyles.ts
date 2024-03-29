import { FeatureLike } from 'ol/Feature';
import { Style, Text, Fill, Stroke } from 'ol/style';
import { getMap } from '../DvkMap';
import { Lang } from '../../../utils/constants';

const styles: Style[] = [];

function getFeatureName(feature: FeatureLike) {
  const dvkMap = getMap();
  const featureName = feature.get('name');
  if ((dvkMap.i18n.resolvedLanguage as Lang) === 'sv') {
    return '' + (featureName.sv || featureName.fi);
  }
  return '' + (featureName.fi || featureName.sv);
}

export function getNameStyle(feature: FeatureLike, resolution: number) {
  const priority = feature.get('priority') as number;
  const visible =
    (priority === 6 && resolution < 10) ||
    (priority === 5 && resolution < 25) ||
    (priority === 4 && resolution < 35) ||
    (priority === 3 && resolution < 65) ||
    priority === 2;

  if (visible) {
    let style = styles[priority];
    if (!style) {
      style = styles[priority] = new Style({
        text: new Text({
          font: `bold ${16 - priority}px "Exo2"`,
          placement: 'point',
          text: '',
          fill: new Fill({
            color: '#000000',
          }),
          stroke: new Stroke({
            width: 1,
            color: '#FFFFFF',
          }),
        }),
      });
    }
    style.getText()?.setText(getFeatureName(feature));
    return style;
  }
  return undefined;
}

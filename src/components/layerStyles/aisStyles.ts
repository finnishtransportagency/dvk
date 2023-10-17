import { FeatureLike } from 'ol/Feature';
import { Style, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { AisFeatureProperties } from '../features';

export function getAisStyle(feature: FeatureLike, selected: boolean) {
  console.log('AIS STYLE');
  const props = feature.getProperties() as AisFeatureProperties;
  const color = props.heading === 0 ? '#00ff00' : '#ff0000';
  const radius = selected ? 10 : 5;

  return new Style({
    image: new CircleStyle({
      radius: radius,
      fill: new Fill({
        color: color,
      }),
    }),
  });
}

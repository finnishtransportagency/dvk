import { Style, Fill, Stroke } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { FeatureDataLayerId } from '../../../utils/constants';

const areaStyle = new Style({
  fill: new Fill({
    color: 'rgba(236, 14, 14, 0.1)',
  }),
});

const borderLineStyle = new Style({
  stroke: new Stroke({
    color: '#EC0E0E',
  }),
});

export function getFairwayArea12Style(feature: FeatureLike, resolution: number) {
  const ds = feature.getProperties().dataSource as FeatureDataLayerId | 'area12Borderline';
  if (ds === 'area12') {
    return areaStyle;
  } else if (ds === 'area12Borderline' && resolution <= 30) {
    const props = feature.getProperties();
    const a1Props = props.area1Properties;
    const a2Props = props.area2Properties;

    let strokeWidth = resolution > 15 ? 0.5 : 1;

    if (a1Props && a2Props) {
      if (a1Props.typeCode === a2Props.typeCode && a1Props.depth === a2Props.depth) {
        return undefined;
      } else {
        strokeWidth = strokeWidth / 2;
      }
    }

    borderLineStyle.getStroke()?.setWidth(strokeWidth);
    return borderLineStyle;
  }
  return undefined;
}

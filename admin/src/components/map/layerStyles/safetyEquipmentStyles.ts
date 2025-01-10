import { Fill, Icon, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { FeatureLike } from 'ol/Feature';
import virtual from '../../../theme/img/safetyequipment/virtual.svg';
import Text from 'ol/style/Text';
import { EquipmentFeatureProperties } from '../features';
import { symbol2Icon } from './safetyEquipmentIcons';

const COLORS = {
  default: '#231F20',
  aisTextFill: '#FF00FF',
  aisTextStroke: 'rgba(255,255,255,0.75)',
  circleFill: 'rgba(0,0,0,0)',
};

function getVirtualEquipmentStyle(feature: FeatureLike, selected: boolean) {
  const props = feature.getProperties() as EquipmentFeatureProperties;
  let text;
  if (props.aisType === 2 || props.aisType === 3) {
    text = 'AIS';
  } else {
    text = 'V-AIS';
  }

  return new Style({
    image: new Icon({
      src: virtual,
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      scale: selected ? 1.2 : 1,
    }),
    text: text
      ? new Text({
          font: '12px "Exo2"',
          placement: 'line',
          offsetY: selected ? 17 : 15,
          text,
          scale: selected ? 1.2 : 1,
          fill: new Fill({
            color: COLORS.aisTextFill,
          }),
          stroke: new Stroke({ width: 1, color: COLORS.aisTextStroke }),
        })
      : undefined,
  });
}

function getImage(icon: string, selected: boolean) {
  return new Icon({
    src: icon,
    color: COLORS.default,
    scale: selected ? 1.2 : 1,
  });
}

function getAnchoredImage(icon: string, selected: boolean, anchorY: number): Icon {
  return new Icon({
    src: icon,
    color: COLORS.default,
    anchor: [0.5, anchorY],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    scale: selected ? 1.2 : 1,
  });
}

export const getSafetyEquipmentStyle = (feature: FeatureLike, resolution: number, selected: boolean) => {
  const props = feature.getProperties() as EquipmentFeatureProperties;
  const key = props.symbol as keyof typeof symbol2Icon;
  const opts = symbol2Icon[key];
  const icon = opts?.icon || symbol2Icon['?'].icon;
  const center = opts ? opts.center : true;
  const anchorY = opts ? opts.anchorY : 0;
  if (props.symbol === '1' || resolution <= 10) {
    const styles = [
      new Style({
        image: center ? getImage(icon, selected) : getAnchoredImage(icon, selected, anchorY),
      }),
      new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({
            color: COLORS.circleFill,
          }),
        }),
      }),
    ];
    if (props.aisType !== undefined && props.aisType !== 1) {
      styles.push(getVirtualEquipmentStyle(feature, selected));
    }
    return styles;
  }
  return undefined;
};

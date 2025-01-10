import { Fill, Icon, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { FeatureLike } from 'ol/Feature';
import virtual from '../../theme/img/safetyequipment/virtual.svg';
import errorIcon from '../../theme/img/safetyequipment/error_icon.svg';
import Text from 'ol/style/Text';
import { EquipmentFeatureProperties } from '../features';
import { symbol2Icon } from './safetyEquipmentIcons';

const iconStyles: Array<{ key: keyof typeof symbol2Icon; style: Style }> = [];
const faultIconStyles: Array<{ key: keyof typeof symbol2Icon; style: Style }> = [];

const COLORS = {
  fault: '#EC0E0E',
  default: '#231F20',
  aisTextFill: '#FF00FF',
  aisTextStroke: 'rgba(255,255,255,0.75)',
  circleFill: 'rgba(0,0,0,0)',
};

function getImage(icon: string, selected: boolean, color: string) {
  return new Icon({
    src: icon,
    color: color,
    scale: selected ? 1.2 : 1,
    declutterMode: 'obstacle',
  });
}

function getAnchoredImage(icon: string, selected: boolean, anchorY: number, color: string): Icon {
  return new Icon({
    src: icon,
    color: color,
    anchor: [0.5, anchorY],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    scale: selected ? 1.2 : 1,
    declutterMode: 'obstacle',
  });
}

/* Fault styles */
const faultLeftStyleAnchorZero = new Style({
  image: new Icon({
    src: errorIcon,
    anchor: [-0.85, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    declutterMode: 'obstacle',
  }),
});
const faultLeftStyleAnchorNotZero = new Style({
  image: new Icon({
    src: errorIcon,
    anchor: [-0.85, 1.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    declutterMode: 'obstacle',
  }),
});
const faultRightStyleAnchorZero = new Style({
  image: new Icon({
    src: errorIcon,
    anchor: [1.85, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    declutterMode: 'obstacle',
  }),
});
const faultRightStyleAnchorNotZero = new Style({
  image: new Icon({
    src: errorIcon,
    anchor: [1.85, 1.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    declutterMode: 'obstacle',
  }),
});

function getFaultStyles(anchorY: number, selected: boolean) {
  if (anchorY === 0) {
    faultLeftStyleAnchorZero.getImage()?.setScale(selected ? 1.2 : 1);
    faultRightStyleAnchorZero.getImage()?.setScale(selected ? 1.2 : 1);
    return [faultLeftStyleAnchorZero, faultRightStyleAnchorZero];
  } else {
    faultLeftStyleAnchorNotZero.getImage()?.setScale(selected ? 1.2 : 1);
    faultRightStyleAnchorNotZero.getImage()?.setScale(selected ? 1.2 : 1);
    return [faultLeftStyleAnchorNotZero, faultRightStyleAnchorNotZero];
  }
}

function getAisStyles(aisType: number, selected: boolean) {
  const text = aisType === 2 || aisType === 3 ? 'AIS' : 'V-AIS';

  return [
    new Style({
      image: new Icon({
        src: virtual,
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: selected ? 1.2 : 1,
        declutterMode: 'obstacle',
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
    }),
  ];
}

const hitAreaStyle = new Style({
  image: new CircleStyle({
    radius: 10,
    fill: new Fill({
      color: COLORS.circleFill,
    }),
  }),
});

function handleSafetyEquipmentFaults(
  key: keyof typeof symbol2Icon,
  center: boolean,
  icon: string,
  selected: boolean,
  anchorY: number,
  styles: Style[],
  resolution: number
) {
  let faultIconStyle = faultIconStyles.find((s) => {
    return s.key === key;
  });
  if (!faultIconStyle) {
    faultIconStyle = {
      key: key,
      style: new Style({
        image: center ? getImage(icon, selected, COLORS.fault) : getAnchoredImage(icon, selected, anchorY, COLORS.fault),
        zIndex: 315,
      }),
    };
    faultIconStyles.push(faultIconStyle);
  }
  faultIconStyle.style.getImage()?.setScale(selected ? 1.2 : 1);
  styles.push(faultIconStyle.style);
  if (resolution <= 10) {
    styles.push(...getFaultStyles(anchorY, selected));
  }
}

function handleSafetyEquipment(key: keyof typeof symbol2Icon, center: boolean, icon: string, selected: boolean, anchorY: number, styles: Style[]) {
  let iconStyle = iconStyles.find((s) => {
    return s.key === key;
  });
  if (!iconStyle) {
    iconStyle = {
      key: key,
      style: new Style({
        image: center ? getImage(icon, selected, COLORS.default) : getAnchoredImage(icon, selected, anchorY, COLORS.default),
        zIndex: 315,
      }),
    };
    iconStyles.push(iconStyle);
  }
  iconStyle.style.getImage()?.setScale(selected ? 1.2 : 1);
  styles.push(iconStyle.style);
}

function handleAis(type: number, selected: boolean, styles: Style[]) {
  styles.push(...getAisStyles(type, selected));
}

export const getSafetyEquipmentStyle = (feature: FeatureLike, resolution: number, selected: boolean, alwaysVisible: boolean | undefined) => {
  const props = feature.getProperties() as EquipmentFeatureProperties;
  const key = props.symbol as keyof typeof symbol2Icon;
  const opts = symbol2Icon[key];
  const icon = opts?.icon || symbol2Icon['?'].icon;
  const center = opts ? opts.center : true;
  const anchorY = opts ? opts.anchorY : 0;
  //declutterMode and zIndex in these styles are for selected fairway card
  if (props.symbol === '1' || resolution <= 10 || !!alwaysVisible) {
    const styles = [hitAreaStyle];
    if (props.faults) {
      handleSafetyEquipmentFaults(key, center, icon, selected, anchorY, styles, resolution);
    } else {
      handleSafetyEquipment(key, center, icon, selected, anchorY, styles);
    }
    if (props.aisType !== undefined && props.aisType !== 1) {
      handleAis(props.aisType, selected, styles);
    }
    return styles;
  }
  return undefined;
};

import { FeatureLike } from 'ol/Feature';
import { Style, Text, Fill, Stroke, Icon } from 'ol/style';
import { getMap } from '../DvkMap';
import { Lang } from '../../utils/constants';
import { QuayFeatureProperties } from '../features';
import CircleStyle from 'ol/style/Circle';
import quayIcon from '../../theme/img/dock_icon.svg';
import quayIconActive from '../../theme/img/dock_icon_active.svg';
import quaySectionIcon from '../../theme/img/quay_section.svg';
import quaySectionIconActive from '../../theme/img/quay_section_active.svg';

function getSectionStyle(selected: boolean, props: QuayFeatureProperties) {
  const color = selected ? '#0064AF' : '#000000';
  const depth = props.depth ? `${props.depth[0]} m` : '';
  const image = new Icon({
    src: quaySectionIcon,
    anchor: [0.5, 19],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });
  const activeImage = new Icon({
    src: quaySectionIconActive,
    anchor: [0.5, 19],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  });

  return new Style({
    image: selected ? activeImage : image,
    text: new Text({
      font: '14px "Exo2"',
      placement: 'line',
      offsetY: -29,
      text: depth,
      fill: new Fill({
        color: color,
      }),
      stroke: new Stroke({
        width: 2,
        color: '#ffffff',
      }),
    }),
  });
}

export function getQuayStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  if (resolution > 3) {
    return undefined;
  }

  const featureType = feature.get('featureType');
  const props = feature.getProperties() as QuayFeatureProperties;
  if (featureType === 'section') {
    return getSectionStyle(selected, props);
  }

  const dvkMap = getMap();
  const lang = dvkMap.i18n.resolvedLanguage as Lang;
  const quayName = props.quay?.[lang] ?? '';
  const depthText =
    props.depth && props.depth.length > 0 ? `${props.depth.map((d) => dvkMap.t('popup.quay.number', { val: d })).join(' m / ')} m` : '';

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
  const labelFill = new Fill({
    color: selected ? '#0064AF' : '#000000',
  });
  const labelStroke = new Stroke({
    width: 3,
    color: '#ffffff',
  });
  const labelZIndex = selected ? 10 : 1;

  const quayStyle = [
    new Style({
      image: selected ? activeImage : image,
      text: new Text({
        font: 'bold 18px "Exo2"',
        placement: 'line',
        offsetY: props.showDepth ? -72 : -55,
        text: quayName,
        fill: labelFill,
        stroke: labelStroke,
      }),
      zIndex: labelZIndex,
    }),
    new Style({
      image: new CircleStyle({
        radius: 20,
        displacement: [0, 20],
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
      }),
      zIndex: selected ? 11 : 2,
    }),
  ];

  if (props.showDepth) {
    quayStyle.push(
      new Style({
        text: new Text({
          font: '12px "Exo2"',
          placement: 'line',
          offsetY: -53,
          text: depthText,
          fill: labelFill,
          stroke: labelStroke,
        }),
        zIndex: labelZIndex,
      })
    );
  }

  return quayStyle;
}

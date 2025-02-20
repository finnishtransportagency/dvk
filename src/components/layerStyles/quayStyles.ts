import { FeatureLike } from 'ol/Feature';
import { Style, Text, Fill, Stroke, Icon } from 'ol/style';
import { getMap } from '../DvkMap';
import { Lang } from '../../utils/constants';
import { QuayFeatureProperties } from '../features';
import quayIcon from '../../theme/img/dock_icon.svg';
import quayIconActive from '../../theme/img/dock_icon_active.svg';
import quaySectionIcon from '../../theme/img/quay_section.svg';
import quaySectionIconActive from '../../theme/img/quay_section_active.svg';

const sectionStyle = new Style({
  image: new Icon({
    src: quaySectionIcon,
    anchor: [0.5, 19],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  text: new Text({
    font: '14px "Exo2"',
    placement: 'line',
    offsetY: -29,
    text: '',
    fill: new Fill({
      color: '#000000',
    }),
    stroke: new Stroke({
      width: 2,
      color: '#ffffff',
    }),
  }),
});

const sectionSelectedStyle = new Style({
  image: new Icon({
    src: quaySectionIconActive,
    anchor: [0.5, 19],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  text: new Text({
    font: '14px "Exo2"',
    placement: 'line',
    offsetY: -29,
    text: '',
    fill: new Fill({
      color: '#0064AF',
    }),
    stroke: new Stroke({
      width: 2,
      color: '#ffffff',
    }),
  }),
});

function getSectionStyle(selected: boolean, props: QuayFeatureProperties) {
  const s = selected ? sectionSelectedStyle : sectionStyle;
  s.getText()?.setText(props.depth ? `${props.depth[0]} m` : '');
  return s;
}

const quayStyle = new Style({
  image: new Icon({
    src: quayIcon,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  text: new Text({
    font: 'bold 18px "Exo2"',
    placement: 'line',
    offsetY: 0,
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

const quaySelectedStyle = new Style({
  image: new Icon({
    src: quayIconActive,
    anchor: [0.5, 43],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
  }),
  text: new Text({
    font: 'bold 18px "Exo2"',
    placement: 'line',
    offsetY: 0,
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

const depthStyle = new Style({
  text: new Text({
    font: '12px "Exo2"',
    placement: 'line',
    offsetY: -53,
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

const depthSelectedStyle = new Style({
  text: new Text({
    font: '12px "Exo2"',
    placement: 'line',
    offsetY: -53,
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

  const s = selected ? quaySelectedStyle : quayStyle;
  s.getText()?.setOffsetY(-55);
  s.getText()?.setText(quayName);

  const styles = [s];

  if (props.showDepth && resolution < 2) {
    const depthText =
      props.depth && props.depth.length > 0 ? `${props.depth.map((d) => dvkMap.t('popup.quay.number', { val: d })).join(' m / ')} m` : '';
    const ds = selected ? depthSelectedStyle : depthStyle;
    ds.getText()?.setOffsetY(10);
    ds.getText()?.setText(depthText);
    styles.push(ds);
  }

  return styles;
}

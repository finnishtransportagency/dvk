import { FeatureLike } from 'ol/Feature';
import { Style, Icon, Text, Fill } from 'ol/style';
import mareographIcon from '../../theme/img/vedenkorkeus_pohja.svg';
import { MareographFeatureProperties } from '../features';

let style: Style | undefined = undefined;
let selectedStyle: Style | undefined = undefined;

export function getMareographStyle(feature: FeatureLike, selected: boolean) {
  let s = selected ? selectedStyle : style;

  if (!s) {
    if (selected) {
      s = selectedStyle = new Style({
        image: new Icon({
          src: mareographIcon,
          scale: 1.2,
          anchor: [14, 32],
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
        }),
        text: new Text({
          font: 'bold 12px "Exo2"',
          placement: 'line',
          offsetX: 40,
          offsetY: -20,
          text: '',
          fill: new Fill({
            color: '#000000',
          }),
        }),
      });
    } else {
      s = style = new Style({
        image: new Icon({
          src: mareographIcon,
          scale: 1,
          anchor: [14, 32],
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
        }),
        text: new Text({
          font: 'bold 12px "Exo2"',
          placement: 'line',
          offsetX: 40,
          offsetY: -16,
          text: '',
          fill: new Fill({
            color: '#000000',
          }),
        }),
      });
    }
  }
  const props = feature.getProperties() as MareographFeatureProperties;
  s.getText().setText(`${Math.round(props.waterLevel / 10)}/${Math.round(props.n2000WaterLevel / 10)} cm`);
  return s;
}

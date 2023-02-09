import { Style, Icon } from 'ol/style';
import buoyIcon from '../../theme/img/buoy.svg';

let style: Style | undefined = undefined;
let selectedStyle: Style | undefined = undefined;

export function getBuoyStyle(selected: boolean) {
  let s = selected ? selectedStyle : style;

  if (!s) {
    if (selected) {
      s = selectedStyle = new Style({
        image: new Icon({
          src: buoyIcon,
          scale: 1.2,
          anchor: [0.5, 32],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
        }),
      });
    } else {
      s = style = new Style({
        image: new Icon({
          src: buoyIcon,
          scale: 1,
          anchor: [0.5, 32],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
        }),
      });
    }
  }
  return s;
}

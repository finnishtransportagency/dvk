import { Style, Icon, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import pilotIcon from '../../theme/img/pilotPlace.svg';
import pilotIconActive from '../../theme/img/pilotPlace_active.svg';

let style: Style[] | undefined = undefined;
let selectedStyle: Style[] | undefined = undefined;

export function getPilotStyle(selected: boolean) {
  let s = selected ? selectedStyle : style;

  if (!s) {
    if (selected) {
      s = selectedStyle = [
        new Style({
          image: new Icon({
            src: pilotIconActive,
            scale: 1.2,
            anchor: [0.5, 0.5],
          }),
        }),
        new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({
              color: 'rgba(0,0,0,0)',
            }),
          }),
        }),
      ];
    } else {
      s = style = [
        new Style({
          image: new Icon({
            src: pilotIcon,
            scale: 1,
            anchor: [0.5, 0.5],
          }),
        }),
        new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({
              color: 'rgba(0,0,0,0)',
            }),
          }),
        }),
      ];
    }
  }
  return s;
}

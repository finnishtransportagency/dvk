import { Style, Stroke } from 'ol/style';

const pilotingLineStyle = new Style({
  stroke: new Stroke({
    color: '#ff0080',
    width: 1,
  }),
});

export function getRtzStyle() {
  return pilotingLineStyle;
}

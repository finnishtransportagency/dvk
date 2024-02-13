import { Style, Stroke } from 'ol/style';

const pilotLineStyle = new Style({
  stroke: new Stroke({
    color: '#ff0080',
    width: 1,
  }),
});

export function getPilotRouteStyle() {
  return pilotLineStyle;
}

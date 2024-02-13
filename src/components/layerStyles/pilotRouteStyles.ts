import { Style, Stroke } from 'ol/style';

const pilotLineStyle = new Style({
  stroke: new Stroke({
    color: '#000000',
    width: 2,
  }),
});

export function getPilotRouteStyle() {
  return pilotLineStyle;
}

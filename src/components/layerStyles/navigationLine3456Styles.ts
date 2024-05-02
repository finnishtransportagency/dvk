import { Style, Stroke } from 'ol/style';

const lineStyle = new Style({
  stroke: new Stroke({
    color: '#0000FF',
    width: 1,
  }),
});

const selectedLineStyle = new Style({
  stroke: new Stroke({
    color: '#0000FF',
    width: 2,
  }),
});

export function getNavigationLine3456Style(selected: boolean) {
  return selected ? selectedLineStyle : lineStyle;
}

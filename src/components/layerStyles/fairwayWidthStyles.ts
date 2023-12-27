import { FeatureLike } from 'ol/Feature';
import { LineString } from 'ol/geom';
import { getMeasureLineStyles } from './utils/measureLineStyles';

export function getFairwayWidthStyle(feature: FeatureLike) {
  const width = feature.getProperties().width;
  return getMeasureLineStyles(feature.getGeometry() as LineString, Math.floor(width) + 'm');
}

import { FeatureLike } from 'ol/Feature';
import { LineString, Point } from 'ol/geom';
import { Style, Stroke, Icon } from 'ol/style';
import arrowIcon from '../../theme/img/pilotRouteArrow.svg';
import arrowIconActive from '../../theme/img/pilotRouteArrow_active.svg';
import { nauticalMilesToMeters } from '../../utils/conversions';
import { Coordinate } from 'ol/coordinate';

const pilotLineStyle = (selected: boolean) => {
  return new Style({
    stroke: new Stroke({
      color: selected ? '#EC0E0E' : '#000000',
      width: 2,
    }),
    zIndex: selected ? 2 : 1,
  });
};

const arrowIconStyle = (selected: boolean) => {
  return new Style({
    image: new Icon({
      src: selected ? arrowIconActive : arrowIcon,
      anchor: [1, 0.5],
      rotateWithView: true,
    }),
    zIndex: selected ? 2 : 1,
  });
};

function getMileStoneImageRotation(start: Coordinate, end: Coordinate) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const rotation = Math.atan2(dy, dx);
  return -rotation;
}

export function getPilotRouteStyle(feature: FeatureLike, resolution: number, selected: boolean) {
  const styles: Array<Style> = [pilotLineStyle(selected)];
  const milestoneStyle = arrowIconStyle(selected);
  const lineString = feature.getGeometry() as LineString;
  const totalLength = lineString.getLength();
  let chunkLength = nauticalMilesToMeters(100);

  if (resolution < 2) {
    chunkLength = nauticalMilesToMeters(0.1);
  } else if (resolution < 5) {
    chunkLength = nauticalMilesToMeters(0.5);
  } else if (resolution < 10) {
    chunkLength = nauticalMilesToMeters(1);
  } else if (resolution < 20) {
    chunkLength = nauticalMilesToMeters(5);
  } else if (resolution < 100) {
    chunkLength = nauticalMilesToMeters(10);
  }

  // Make sure there is at least one chunk to get arrow at the begining of the route
  const numberOfChunks = Math.max(Math.round(totalLength / chunkLength), 1);

  for (let i = 0; i < numberOfChunks; i++) {
    const coord = lineString.getCoordinateAt((i * chunkLength) / totalLength);

    let l = 0;
    const rotation = lineString.forEachSegment((start, end) => {
      l += new LineString([start, end]).getLength();
      if (l > i * chunkLength) {
        return getMileStoneImageRotation(start, end);
      }
    });

    const s = milestoneStyle.clone();
    s.setGeometry(new Point(coord));
    if (rotation) {
      s.getImage()?.setRotation(rotation as number);
    }
    styles.push(s);
  }

  // Add arrow at the end of the route
  const coordinates = lineString.getCoordinates();
  if (coordinates.length > 1) {
    const start = coordinates[coordinates.length - 2];
    const end = coordinates[coordinates.length - 1];
    const s = milestoneStyle.clone();
    s.setGeometry(new Point(end));
    s.getImage()?.setRotation(getMileStoneImageRotation(start, end));
    styles.push(s);
  }

  return styles;
}

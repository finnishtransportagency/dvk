import { Point, SimpleGeometry, Geometry, LineString } from 'ol/geom';
import Map from 'ol/Map';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { MAP } from '../../utils/constants';
// eslint-disable-next-line import/named
import Feature, { FeatureLike } from 'ol/Feature';
import dvkMap from '../DvkMap';
import { GeoJSON } from 'ol/format';
import * as turf from '@turf/turf';
import { Coordinate } from 'ol/coordinate';
import { addPointerClickInteraction, addPointerMoveInteraction } from './selectInteraction';

export function deselectClickSelection() {
  dvkMap.olMap?.getInteractions()?.forEach((int) => {
    if (int.get('name') === 'clickSelection') {
      (int as Select).getFeatures().clear();
    }
  });
}

export function addPopup(map: Map, setPopupProperties: (properties: PopupProperties) => void) {
  const container = document.getElementById('popup') as HTMLElement;
  const overlay = new Overlay({
    element: container,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });
  const types = [
    'aisvessel',
    'pilot',
    'vtspoint',
    'quay',
    'harbor',
    'marinewarning',
    'safetyequipment',
    'safetyequipmentfault',
    'observation',
    'buoy',
    'mareograph',
    'vtsline',
    'line',
    'specialarea2',
    'specialarea15',
    'area',
  ];
  if (container) {
    container.addEventListener('pointercancel', (e) => {
      e.preventDefault();
    });
    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
    });
  }

  map.addOverlay(overlay);
  map.on('singleclick', function (evt) {
    /* Remove fairway width features */
    dvkMap.getVectorSource('fairwaywidth').clear();

    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(
      evt.pixel,
      function (f) {
        if (types.includes(f.getProperties().featureType)) {
          features.push(f);
        }
      },
      { hitTolerance: 3 }
    );
    features.sort((a, b) => types.indexOf(a.getProperties().featureType) - types.indexOf(b.getProperties().featureType));
    const feature = features[0];

    overlay.setPosition(undefined);
    setPopupProperties({});
    deselectClickSelection();

    if (feature) {
      // Add prioritized feature to clickSelection
      map?.getInteractions()?.forEach((int) => {
        if (int.get('name') === 'clickSelection') {
          (int as Select).getFeatures().push(feature as Feature<Geometry>);
        }
      });

      let popupPositioningCoordinate: Coordinate | undefined = undefined;

      if (feature.getProperties().featureType === 'mareograph') {
        overlay.setPositioning('center-right');
        overlay.setOffset([-20, 0]);
      } else {
        overlay.setPositioning('center-left');
        overlay.setOffset([20, 0]);
      }
      const geom = (feature.getGeometry() as SimpleGeometry).clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;

      /* If selected feature is navigation line start "fairway width calculation process" */
      if (feature.getProperties().featureType === 'line') {
        let fairwayWidth: number | undefined = undefined;
        let areaFeatures = features.filter((f) => {
          return f.getProperties().featureType === 'area';
        });

        /* Continue only if clicked point is inside area polygon (area layer must be visible) */
        if (areaFeatures.length > 0) {
          const format = new GeoJSON();
          const turfLine = format.writeGeometryObject(feature.getGeometry() as Geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: MAP.EPSG,
          }) as turf.LineString;
          const turfPoint = format.writeGeometryObject(new Point(evt.coordinate) as Geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: MAP.EPSG,
          }) as turf.Point;

          const pointOnLine = turf.nearestPointOnLine(turfLine, turfPoint);
          if (
            pointOnLine.properties.index !== undefined &&
            pointOnLine.properties.dist !== undefined &&
            pointOnLine.properties.location !== undefined
          ) {
            /* The point on line nearest to the clicked point */
            const turfSnapPoint = turf.along(turfLine, pointOnLine.properties.location);

            /* Filter areas containing snap point */
            areaFeatures = areaFeatures.filter((f) => {
              const turfArea = format.writeGeometryObject(f.getGeometry() as Geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: MAP.EPSG,
              }) as turf.Polygon;
              return turf.booleanPointInPolygon(turfSnapPoint, turfArea);
            });

            /* Continue only if we have only one area polygon that contains snap point */
            if (areaFeatures.length === 1) {
              const turfArea = format.writeGeometryObject(areaFeatures[0].getGeometry() as Geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: MAP.EPSG,
              }) as turf.Polygon;
              /* Get line azimuth at snap point */
              const azimuth = turf.bearingToAzimuth(
                turf.bearing(turfLine.coordinates[pointOnLine.properties.index], turfLine.coordinates[pointOnLine.properties.index + 1])
              );
              /* Create lines perpendicular navigation to line and length of 5km to both direction from snap point */
              const startPoint = turf.transformTranslate(turfSnapPoint, 5, azimuth >= 90 ? azimuth - 90 : azimuth - 90 + 360);
              const endPoint = turf.transformTranslate(turfSnapPoint, 5, azimuth <= 270 ? azimuth + 90 : azimuth + 90 - 360);

              const turfStartPerpendicularLine = turf.lineString([turfSnapPoint.geometry.coordinates, startPoint.geometry.coordinates]);
              const turfEndPerpendicularLine = turf.lineString([turfSnapPoint.geometry.coordinates, endPoint.geometry.coordinates]);

              /* Find perpendicular lines and fairway area polygon intersections */
              const startInterSectionPoints = turf.lineIntersect(turfStartPerpendicularLine, turfArea);
              const startIntersectionPointsArray = startInterSectionPoints.features.map((d) => {
                return d.geometry.coordinates;
              });
              const endInterSectionPoints = turf.lineIntersect(turfEndPerpendicularLine, turfArea);
              const endIntersectionPointsArray = endInterSectionPoints.features.map((d) => {
                return d.geometry.coordinates;
              });
              /* Find start and end intersection points nearest to the snap point */
              let minDist = 5;
              let startCoord = undefined;
              for (const coord of startIntersectionPointsArray) {
                const dist = turf.distance(turfSnapPoint, coord);
                if (dist < minDist) {
                  startCoord = coord;
                  minDist = dist;
                }
              }
              minDist = 5;
              let endCoord = undefined;
              for (const coord of endIntersectionPointsArray) {
                const dist = turf.distance(turfSnapPoint, coord);
                if (dist < minDist) {
                  endCoord = coord;
                  minDist = dist;
                }
              }

              if (startCoord && endCoord) {
                const turfFairwayWidthLine = turf.lineString([startCoord, endCoord]);
                fairwayWidth = turf.length(turfFairwayWidthLine) * 1000;

                const fairwayWidthLineFeat = format.readFeature(turfFairwayWidthLine, {
                  dataProjection: 'EPSG:4326',
                  featureProjection: MAP.EPSG,
                }) as Feature<Geometry>;
                fairwayWidthLineFeat.setProperties({ width: fairwayWidth });

                dvkMap.getFeatureLayer('fairwaywidth').setVisible(true);
                const source = dvkMap.getVectorSource('fairwaywidth');
                source.clear();
                source.addFeature(fairwayWidthLineFeat);

                /* Set popup position right to the fairway width line */
                const geometry = fairwayWidthLineFeat.getGeometry() as LineString;
                const s = geometry.getFirstCoordinate();
                const e = geometry.getLastCoordinate();
                popupPositioningCoordinate = s[0] > e[0] ? s : e;
              }
            }
          }
        }
        setPopupProperties({
          [feature.getProperties().featureType]: {
            coordinates: geom.getCoordinates() as number[],
            properties: feature.getProperties(),
            width: fairwayWidth,
          },
        });
      } else {
        setPopupProperties({
          [feature.getProperties().featureType]: {
            coordinates: geom.getCoordinates() as number[],
            properties: feature.getProperties(),
          },
        });
      }
      /* Set timeout to make sure popup content is rendered before positioning, so autoPan works correctly */
      setTimeout(() => {
        if (popupPositioningCoordinate) {
          overlay.setPosition(popupPositioningCoordinate);
        } else if (feature.getGeometry()?.getType() === 'Point') {
          overlay.setPosition((feature.getGeometry() as Point).getCoordinates());
        } else {
          overlay.setPosition(evt.coordinate);
        }
      }, 100);
    }
  });

  addPointerMoveInteraction(map, types);
  addPointerClickInteraction(map);
}

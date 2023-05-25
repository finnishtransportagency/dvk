import { Point, SimpleGeometry, Geometry } from 'ol/geom';
import Map from 'ol/Map';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { MAP } from '../../utils/constants';
import { pointerMove } from 'ol/events/condition';
// eslint-disable-next-line import/named
import { FeatureLike } from 'ol/Feature';
import { getQuayStyle, getAreaStyle, getSpecialAreaStyle, getLineStyle, getBoardLineStyle, getHarborStyle } from '../layers';
import dvkMap from '../DvkMap';
import { getPilotStyle } from '../layerStyles/pilotStyles';
import { getSafetyEquipmentStyle } from '../layerStyles/safetyEquipmentStyles';
import { getMarineWarningStyle } from '../layerStyles/marineWarningStyles';
import { getMareographStyle } from '../layerStyles/mareographStyles';
import { getObservationStyle } from '../layerStyles/observationStyles';
import { getBuoyStyle } from '../layerStyles/buoyStyles';
import { getVtsStyle } from '../layerStyles/vtsStyles';
import { GeoJSON } from 'ol/format';
import * as turf from '@turf/turf';

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
    'pilot',
    'vtspoint',
    'quay',
    'harbor',
    'marinewarning',
    'safetyequipment',
    'observation',
    'buoy',
    'mareograph',
    'vtsline',
    'line',
    'area',
    'specialarea',
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

    if (feature) {
      if (feature.getProperties().featureType === 'mareograph') {
        overlay.setPositioning('center-right');
        overlay.setOffset([-20, 0]);
      } else {
        overlay.setPositioning('center-left');
        overlay.setOffset([20, 0]);
      }
      const geom = (feature.getGeometry() as SimpleGeometry).clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;

      /* --> */
      const sTs = performance.now();

      /* If selected feature is navigation line start "fairway width calculation process" */
      if (feature.getProperties().featureType === 'line') {
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
              /* Create line perpendicular navigation line and length of 10km to both direction from snap point */
              const startPoint = turf.transformTranslate(turfSnapPoint, 10, azimuth >= 90 ? azimuth - 90 : azimuth - 90 + 360);
              const endPoint = turf.transformTranslate(turfSnapPoint, 10, azimuth <= 270 ? azimuth + 90 : azimuth + 90 - 360);
              const turfPerpendicularLine = turf.lineString([startPoint.geometry.coordinates, endPoint.geometry.coordinates]);
              /* Find line part that intersects area polygon */
              const interSectionPoints = turf.lineIntersect(turfPerpendicularLine, turfArea);
              const intersectionPointsArray = interSectionPoints.features.map((d) => {
                return d.geometry.coordinates;
              });
              const turfFairwayWidthLine = turf.lineSlice(
                turf.point(intersectionPointsArray[0]),
                turf.point(intersectionPointsArray[1]),
                turfPerpendicularLine
              );
              const fairwayWidth = turf.length(turfFairwayWidthLine) * 1000;
              console.log(turfArea);
              console.log(turfLine);
              console.log(turfPoint);
              console.log(pointOnLine);
              console.log(turfSnapPoint);
              console.log(azimuth);
              console.log(turfPerpendicularLine);
              console.log(interSectionPoints);
              console.log(turfFairwayWidthLine);
              console.log('FAIRWAY WIDTH: ' + turf.round(fairwayWidth, 0) + 'm');
            }
          }
        }
      }
      console.log('DURATION: ' + (performance.now() - sTs) + 'ms');
      /* <-- */

      setPopupProperties({
        [feature.getProperties().featureType]: {
          coordinates: geom.getCoordinates() as number[],
          properties: feature.getProperties(),
        },
      });
      /* Set timeout to make sure popup content is rendered before positioning, so autoPan works correctly */
      setTimeout(() => {
        if (feature.getGeometry()?.getType() === 'Point') {
          overlay.setPosition((feature.getGeometry() as Point).getCoordinates());
        } else {
          overlay.setPosition(evt.coordinate);
        }
      }, 100);
    }
  });
  const style = function (feature: FeatureLike, resolution: number) {
    const type = feature.getProperties().featureType;
    const dataSource = feature.getProperties().dataSource;
    const selected: boolean | undefined = feature.getProperties().selected;
    if (type === 'quay') {
      return getQuayStyle(feature, resolution, true);
    } else if (type === 'harbor') {
      return getHarborStyle(feature, resolution, 0, true);
    } else if (type === 'pilot') {
      return getPilotStyle(true);
    } else if (type === 'area' && dataSource === 'area12') {
      return getAreaStyle('#EC0E0E', 1, selected ? 'rgba(236,14,14,0.5)' : 'rgba(236,14,14,0.3)');
    } else if (type === 'area' && dataSource === 'area3456') {
      return getAreaStyle('#207A43', 1, selected ? 'rgba(32,122,67,0.5)' : 'rgba(32,122,67,0.3)');
    } else if (type === 'specialarea') {
      return getSpecialAreaStyle(feature, '#C57A11', 2, true, selected);
    } else if (type === 'line') {
      return getLineStyle('#0000FF', 2);
    } else if (type === 'safetyequipment') {
      return getSafetyEquipmentStyle(feature, feature.get('safetyEquipmentFaultList') ? 1 : resolution, true);
    } else if (type === 'marinewarning') {
      return getMarineWarningStyle(feature, true);
    } else if (type === 'boardline') {
      return getBoardLineStyle('#000000', 1);
    } else if (type === 'mareograph') {
      return getMareographStyle(feature, true, resolution);
    } else if (type === 'observation') {
      return getObservationStyle(true);
    } else if (type === 'buoy') {
      return getBuoyStyle(true);
    } else if (type === 'vtsline' || type === 'vtspoint') {
      return getVtsStyle(feature, true);
    } else {
      return undefined;
    }
  };

  const pointerMoveSelect = new Select({
    condition: pointerMove,
    style,
    layers: [
      dvkMap.getFeatureLayer('pilot'),
      dvkMap.getFeatureLayer('quay'),
      dvkMap.getFeatureLayer('area12'),
      dvkMap.getFeatureLayer('area3456'),
      dvkMap.getFeatureLayer('specialarea'),
      dvkMap.getFeatureLayer('selectedfairwaycard'),
      dvkMap.getFeatureLayer('line12'),
      dvkMap.getFeatureLayer('line3456'),
      dvkMap.getFeatureLayer('safetyequipment'),
      dvkMap.getFeatureLayer('marinewarning'),
      dvkMap.getFeatureLayer('mareograph'),
      dvkMap.getFeatureLayer('observation'),
      dvkMap.getFeatureLayer('buoy'),
      dvkMap.getFeatureLayer('harbor'),
      dvkMap.getFeatureLayer('vtsline'),
      dvkMap.getFeatureLayer('vtspoint'),
    ],
    hitTolerance: 3,
    multi: true,
  });
  pointerMoveSelect.on('select', (e) => {
    const hit = e.selected.length > 0 && e.selected.some((f) => types.includes(f.getProperties().featureType));
    const target = map.getTarget() as HTMLElement;
    target.style.cursor = hit ? 'pointer' : '';
  });
  map.addInteraction(pointerMoveSelect);
}

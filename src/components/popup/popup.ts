import { Point, SimpleGeometry, Geometry, LineString } from 'ol/geom';
import Map from 'ol/Map';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { MAP } from '../../utils/constants';
import Feature, { FeatureLike } from 'ol/Feature';
import dvkMap from '../DvkMap';
import { Coordinate } from 'ol/coordinate';
import { addPointerClickInteraction, addPointerMoveInteraction, deselectClickSelection } from './selectInteraction';
import { addFairwayWidthIndicator } from './fairwayWidthIndicator';

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
    'section',
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
        const areaFeatures = features.filter((f) => {
          return f.getProperties().featureType === 'area';
        });

        /* Continue only if clicked point is inside area polygon (area layer must be visible) */
        if (areaFeatures.length > 0) {
          const fairwayWidthFeature: Feature<Geometry> | undefined = addFairwayWidthIndicator(feature, areaFeatures, evt.coordinate);
          if (fairwayWidthFeature) {
            fairwayWidth = fairwayWidthFeature.get('width');
            /* Set popup position right to the fairway width line */
            const geometry = fairwayWidthFeature.getGeometry() as LineString;
            const s = geometry.getFirstCoordinate();
            const e = geometry.getLastCoordinate();
            popupPositioningCoordinate = s[0] > e[0] ? s : e;
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

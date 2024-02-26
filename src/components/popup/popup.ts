import { Point, SimpleGeometry, Geometry, LineString } from 'ol/geom';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { MAP } from '../../utils/constants';
import Feature, { FeatureLike } from 'ol/Feature';
import dvkMap from '../DvkMap';
import { Coordinate } from 'ol/coordinate';
import { addPointerClickInteraction, addPointerMoveInteraction, setClickSelectionFeature, clearClickSelectionFeatures } from './selectInteraction';
import { addFairwayWidthIndicator } from './fairwayWidthIndicator';

export function addPopup(map: Map, setPopupProperties: (properties: PopupProperties) => void) {
  const container = document.getElementById('popup') as HTMLElement;
  const overlay = new Overlay({
    id: 'popup',
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

  addPointerMoveInteraction(map, types);
  addPointerClickInteraction(map);

  map.addOverlay(overlay);
  map.on('singleclick', function (evt) {
    /* Remove fairway width features */
    dvkMap.getVectorSource('fairwaywidth').clear();
    /* Close popup */
    overlay.setPosition(undefined);
    setPopupProperties({});
    clearClickSelectionFeatures();

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

    if (features.length > 1) {
      features.sort((a, b) => types.indexOf(a.getProperties().featureType) - types.indexOf(b.getProperties().featureType));
      showFeatureListPopup(features, evt.coordinate, setPopupProperties, overlay);
    } else {
      const feature = features[0];
      if (feature) {
        setClickSelectionFeature(feature);
        showFeaturePopup(features, feature, evt.coordinate, setPopupProperties, overlay);
      }
    }
  });
}

function showFeatureListPopup(
  features: FeatureLike[],
  coordinate: Coordinate,
  setPopupProperties: (properties: PopupProperties) => void,
  overlay: Overlay
) {
  setPopupProperties({
    featureList: {
      features: features,
      coordinate: coordinate,
    },
  });
  setTimeout(() => {
    overlay.setPosition(coordinate);
  }, 100);
}

export function showFeaturePopup(
  features: FeatureLike[],
  selectedFeature: FeatureLike,
  coordinate: Coordinate,
  setPopupProperties: (properties: PopupProperties) => void,
  overlay?: Overlay
) {
  let popupPositioningCoordinate: Coordinate | undefined = undefined;
  const popup = overlay ?? dvkMap.olMap?.getOverlayById('popup');
  if (!popup) return;

  if (selectedFeature.getProperties().featureType === 'mareograph') {
    popup.setPositioning('center-right');
    popup.setOffset([-20, 0]);
  } else {
    popup.setPositioning('center-left');
    popup.setOffset([20, 0]);
  }
  const geom = (selectedFeature.getGeometry() as SimpleGeometry).clone().transform(MAP.EPSG, 'EPSG:4326') as SimpleGeometry;

  /* If selected feature is navigation line start "fairway width calculation process" */
  if (selectedFeature.getProperties().featureType === 'line') {
    let fairwayWidth: number | undefined = undefined;
    const areaFeatures = features.filter((f) => {
      return f.getProperties().featureType === 'area';
    });

    /* Continue only if clicked point is inside area polygon (area layer must be visible) */
    if (areaFeatures.length > 0) {
      const fairwayWidthFeature: Feature<Geometry> | undefined = addFairwayWidthIndicator(selectedFeature, areaFeatures, coordinate);
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
      [selectedFeature.getProperties().featureType]: {
        coordinates: geom.getCoordinates() as number[],
        properties: selectedFeature.getProperties(),
        width: fairwayWidth,
      },
    });
  } else {
    setPopupProperties({
      [selectedFeature.getProperties().featureType]: {
        coordinates: geom.getCoordinates() as number[],
        properties: selectedFeature.getProperties(),
      },
    });
  }
  /* Set timeout to make sure popup content is rendered before positioning, so autoPan works correctly */
  setTimeout(() => {
    if (popupPositioningCoordinate) {
      popup.setPosition(popupPositioningCoordinate);
    } else if (selectedFeature.getGeometry()?.getType() === 'Point') {
      popup.setPosition((selectedFeature.getGeometry() as Point).getCoordinates());
    } else {
      popup.setPosition(coordinate);
    }
  }, 100);
}

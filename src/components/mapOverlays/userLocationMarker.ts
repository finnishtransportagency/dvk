import dvkMap from '../DvkMap';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Dispatch } from 'react';
import { Action } from '../../hooks/dvkReducer';
import { GeolocationError } from 'ol/Geolocation';

export const initUserLocation = (dispatch: Dispatch<Action>) => {
  const userLocationControl = dvkMap.getCenterToOwnLocationControl();
  // Permissions API is undefined in test framework
  if (navigator.permissions !== undefined) {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted' || result.state === 'prompt') {
        dispatch({ type: 'setLocationPermission', payload: { value: 'on' } });
      } else if (result.state === 'denied') {
        dispatch({ type: 'setLocationPermission', payload: { value: 'disabled' } });
      }

      // Handle permission denied from location prompt
      userLocationControl.geolocation.on('error', (error: GeolocationError) => {
        // PERMISSION_DENIED: 1 | POSITION_UNAVAILABLE: 2 | TIMEOUT: 3
        if (error.code === 1) {
          dispatch({ type: 'setLocationPermission', payload: { value: 'disabled' } });
        }
      });

      // Listen to changes in browser permissions (temporary permission changes from prompt do not fire this change event)
      result.addEventListener('change', () => {
        if (result.state === 'granted') {
          dispatch({ type: 'setLocationPermission', payload: { value: 'on' } });
        } else if (result.state === 'denied') {
          dispatch({ type: 'setLocationPermission', payload: { value: 'disabled' } });
        }
      });
    });
  }
};

export const placeUserLocationMarker = () => {
  const userLocationControl = dvkMap.getCenterToOwnLocationControl();
  userLocationControl.geolocation.setProjection(dvkMap.olMap?.getView().getProjection());
  userLocationControl.geolocation.setTracking(true);

  userLocationControl.geolocation.once('change:position', () => {
    userLocationControl.geolocation.setTracking(false);

    const position = userLocationControl.geolocation.getPosition();
    if (position) {
      userLocationControl.setDisabled(false);
      const source = dvkMap.getVectorSource('userlocation');
      source.clear();
      source.addFeature(
        new Feature({
          geometry: new Point([position[0], position[1]]),
        })
      );
    }
  });
};

export const removeUserLocationMarker = () => {
  dvkMap.getVectorSource('userlocation').clear();
  dvkMap.getCenterToOwnLocationControl().setDisabled(true);
};

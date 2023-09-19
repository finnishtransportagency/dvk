import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToggleControl from './ToggleControl';
import { useDvkContext } from '../hooks/dvkContext';

const LocationPermissionControl: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'homePage.sidebarMenu' });
  const { state, dispatch } = useDvkContext();
  const [browserLocationDenied, setBrowserLocationDenied] = useState(false);

  const handleToggle = (checked: boolean) => {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (checked) {
        if (result.state === 'granted') {
          dispatch({ type: 'setLocationPermission', payload: { value: checked } });
        } else if (result.state === 'prompt') {
          // Access position to get prompt from browser
          navigator.geolocation.getCurrentPosition(
            () => {
              dispatch({ type: 'setLocationPermission', payload: { value: true } });
            },
            (error: GeolocationPositionError) => {
              // PERMISSION_DENIED: 1 | POSITION_UNAVAILABLE: 2 | TIMEOUT: 3
              if (error.code === 1) {
                dispatch({ type: 'setLocationPermission', payload: { value: false } });
                //setBrowserLocationDenied(true);
              }
            }
          );
        }
      }
    });
  };

  useEffect(() => {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      console.log(result.state);
      if (result.state === 'granted') {
        dispatch({ type: 'setLocationPermission', payload: { value: true } });
      }
      if (result.state === 'denied') {
        setBrowserLocationDenied(true);
      }
      result.addEventListener('change', () => {
        setBrowserLocationDenied(result.state === 'denied');
      });
    });
  }, [dispatch, setBrowserLocationDenied]);

  return (
    <ToggleControl
      checked={state.locationPermission}
      disabled={browserLocationDenied}
      labelTitle={t('location-service')}
      labelText={t('location-description')}
      handleToggle={handleToggle}
    />
  );
};

export default LocationPermissionControl;

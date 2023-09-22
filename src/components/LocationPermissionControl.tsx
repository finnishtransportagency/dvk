import React from 'react';
import { useTranslation } from 'react-i18next';
import ToggleControl from './ToggleControl';
import { useDvkContext } from '../hooks/dvkContext';

const LocationPermissionControl: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'homePage.sidebarMenu' });
  const { state, dispatch } = useDvkContext();

  const handleToggle = (checked: boolean) => {
    if (checked) {
      dispatch({ type: 'setLocationPermission', payload: { value: 'on' } });
    } else {
      dispatch({ type: 'setLocationPermission', payload: { value: 'off' } });
    }
  };

  return (
    <ToggleControl
      checked={state.locationPermission === 'on'}
      disabled={state.locationPermission === 'disabled'}
      labelTitle={t('location-service')}
      labelText={t('location-description')}
      handleToggle={handleToggle}
    />
  );
};

export default LocationPermissionControl;

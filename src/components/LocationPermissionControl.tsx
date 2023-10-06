import React from 'react';
import { useTranslation } from 'react-i18next';
import ToggleControl from './ToggleControl';
import { useDvkContext } from '../hooks/dvkContext';
import alertIcon from '../theme/img/alert_icon.svg';
import { IonIcon, IonItem } from '@ionic/react';

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
    <>
      <ToggleControl
        checked={state.locationPermission === 'on'}
        disabled={state.locationPermission === 'disabled'}
        labelTitle={t('location-service')}
        labelText={t('location-description')}
        handleToggle={handleToggle}
      />
      {state.locationPermission === 'disabled' && (
        <IonItem detail={false} lines="none" className="ion-no-padding">
          <IonIcon aria-hidden slot="start" src={alertIcon} color="danger" />
          {t('location-disabled')}
        </IonItem>
      )}
    </>
  );
};

export default LocationPermissionControl;

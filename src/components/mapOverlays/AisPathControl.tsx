import React from 'react';
import { IonCheckbox, IonCol, IonRow, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './LayerModal.css';
import { useDvkContext } from '../../hooks/dvkContext';
import type { CheckboxCustomEvent } from '@ionic/react';
import { aisLayers } from '../../utils/constants';

const AisPathControl: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useDvkContext();
  const { isOffline, layers } = state;
  const title = 'aisShowPath';
  const disabled = isOffline || !aisLayers.some((l) => layers.includes(l));

  const handleChange = (event: CheckboxCustomEvent) => {
    const { checked } = event.detail;
    dispatch({ type: 'setShowAisPath', payload: { value: checked } });
  };

  return (
    <IonRow>
      <IonCol>
        <IonItem>
          <IonCheckbox
            aria-labelledby={`${title}-label`}
            checked={state.showAisPath}
            slot="start"
            onIonChange={handleChange}
            disabled={disabled}
            labelPlacement="end"
          >
            <IonText id={`${title}-label`} className={disabled ? 'labelText disabled' : 'labelText'}>
              {t('homePage.map.controls.layer.aisShowPath')}
            </IonText>
          </IonCheckbox>
        </IonItem>
      </IonCol>
    </IonRow>
  );
};

export default AisPathControl;

import React from 'react';
import { IonCheckbox, IonCol, IonRow, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './LayerModal.css';
import { useDvkContext } from '../../hooks/dvkContext';
import type { CheckboxCustomEvent } from '@ionic/react';
import { aisLayers } from '../../utils/constants';

const AisPredictorControl: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useDvkContext();
  const { isOffline, layers } = state;
  const title = 'aisShowPredictor';
  const disabled = isOffline || !aisLayers.some((l) => layers.includes(l));

  const handleChange = (event: CheckboxCustomEvent) => {
    const { checked } = event.detail;
    dispatch({ type: 'setShowAisPredictor', payload: { value: checked } });
  };

  return (
    <IonRow>
      <IonCol>
        <IonItem>
          <IonCheckbox
            aria-labelledby={`${title}-label`}
            checked={state.showAisPredictor}
            slot="start"
            onIonChange={handleChange}
            disabled={disabled}
            labelPlacement="end"
          >
            <IonText id={`${title}-label`} className={disabled ? 'labelText disabled' : 'labelText'}>
              {t('homePage.map.controls.layer.aisShowPredictor')}
            </IonText>
          </IonCheckbox>
        </IonItem>
      </IonCol>
    </IonRow>
  );
};

export default AisPredictorControl;

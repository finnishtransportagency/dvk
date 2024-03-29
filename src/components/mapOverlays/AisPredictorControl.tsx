import React, { useEffect } from 'react';
import { IonCheckbox, IonCol, IonRow, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
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

  useEffect(() => {
    // If none of the AIS layers are selected, uncheck predictor control
    if (!aisLayers.some((l) => layers.includes(l))) {
      dispatch({ type: 'setShowAisPredictor', payload: { value: false } });
    }
  }, [dispatch, layers]);

  return (
    <IonItem>
      <IonCheckbox
        aria-labelledby={`${title}-label`}
        checked={state.showAisPredictor}
        onIonChange={handleChange}
        disabled={disabled}
        labelPlacement="end"
        justify="start"
      >
        <IonRow className="ion-align-items-center ion-justify-content-between">
          <IonCol>
            <IonText id={`${title}-label`} className={disabled ? 'labelText disabled' : 'labelText'}>
              {t('homePage.map.controls.layer.aisShowPredictor')}
            </IonText>
          </IonCol>
          <IonCol size="auto">
            <IonText className={'layerLegend layer ' + title}></IonText>
          </IonCol>
        </IonRow>
      </IonCheckbox>
    </IonItem>
  );
};

export default AisPredictorControl;

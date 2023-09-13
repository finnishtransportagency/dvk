import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/react';
import { useSquatContext } from '../hooks/squatContext';
import { getNumberValueOrEmptyString } from '../utils/calculations';
import { IonSegmentCustomEvent, SegmentChangeEventDetail } from '@ionic/core/dist/types/components';

interface CalculationOptionsProps {
  limitedView: boolean;
  embeddedView?: boolean;
}

const CalculationOptions: React.FC<CalculationOptionsProps> = ({ limitedView, embeddedView }) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squat.calculations' });
  const { state, dispatch } = useSquatContext();

  // Update status to state
  const setStateStatus = useCallback(
    (key: string, value: string | number | undefined) => {
      dispatch({
        type: 'status',
        payload: { key: key, value: value === 'true', elType: 'boolean' },
      });
    },
    [dispatch]
  );

  // Determine values to show
  const getSquatValue = () => {
    const currentValue = state.status.showBarrass ? state.calculations.squat.squatBarrass : state.calculations.squat.squatHG;
    return getNumberValueOrEmptyString(currentValue);
  };

  const handleWaterValuesChange = useCallback(
    (e: IonSegmentCustomEvent<SegmentChangeEventDetail>) => {
      setStateStatus('showDeepWaterValues', e.detail.value);
    },
    [setStateStatus]
  );

  const handleCalculationMethodChange = useCallback(
    (e: IonSegmentCustomEvent<SegmentChangeEventDetail>) => {
      setStateStatus('showBarrass', e.detail.value);
    },
    [setStateStatus]
  );

  const handleSelectedViewChange = useCallback(
    (e: IonSegmentCustomEvent<SegmentChangeEventDetail>) => {
      const val = e.detail.value;
      setStateStatus('showLimitedView', val);
      if (val === 'true') {
        setStateStatus('showDeepWaterValues', 'false');
      }
    },
    [setStateStatus]
  );

  return (
    <div className={'calculation-options in-print top-padding' + (limitedView ? ' print-hide' : '')}>
      {!embeddedView && (
        <>
          <span className="printable segment-label">{t('selected-water-values')}:</span>
          <IonSegment
            onIonChange={handleWaterValuesChange}
            value={state.status.showDeepWaterValues ? 'true' : 'false'}
            disabled={limitedView || !state.environment.weather.waveLength[0]}
            selectOnFocus
          >
            <IonSegmentButton value="false">
              <IonLabel>{t('shallow-water-values')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="true">
              <IonLabel>{t('deep-water-values')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </>
      )}

      <span className="printable segment-label">{t('selected-calculation-method')}:</span>
      <IonSegment
        onIonChange={handleCalculationMethodChange}
        value={state.status.showBarrass ? 'true' : 'false'}
        className="top-padding"
        disabled={getSquatValue() === ''}
        selectOnFocus
      >
        <IonSegmentButton value="false">
          <IonLabel>{t('squat-HG')}</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="true">
          <IonLabel>{t('squat-barrass')}</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {!embeddedView && (
        <>
          <IonSegment onIonChange={handleSelectedViewChange} value={limitedView ? 'true' : 'false'} className="top-padding print-hide" selectOnFocus>
            <IonSegmentButton value="false">
              <IonLabel>{t('extensive-calculator')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="true">
              <IonLabel>{t('limited-calculator')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </>
      )}
    </div>
  );
};

export default CalculationOptions;

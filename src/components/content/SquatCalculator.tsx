import React, { useMemo } from 'react';
import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import {
  SquatChart,
  SquatReducer,
  initialState,
  SquatContext,
  InfoAccordion,
  Vessel,
  Environment,
  CalculationOptions,
  CalculationChecks,
} from 'squatlib';
import 'squatlib/dist/style.css';
import './SquatCalculator.css';

type SquatCalculatorProps = {
  widePane?: boolean;
};

const SquatCalculator: React.FC<SquatCalculatorProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const path = [{ title: t('common.squat') }];
  const [state, dispatch] = React.useReducer(SquatReducer, initialState);
  const providerState = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{t('common.squat')}</strong>
        </h2>
      </IonText>

      <SquatContext.Provider value={providerState}>
        <div id="squatCalculatorContainer" className="squatCalculatorContainer show-print" data-testid="squatCalculatorContainer">
          <InfoAccordion />
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol className="squat-checks">
                <CalculationChecks limitedView={true} embeddedView={true} doChecks={['ukc', 'reliability', 'LBratio', 'BDratio']} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size={widePane ? '6' : '12'} className="squatColumn first squat">
                <CalculationOptions limitedView={true} embeddedView={true} />
                <Vessel limitedView={true} />
              </IonCol>
              <IonCol size={widePane ? '6' : '12'} className="squatColumn last">
                <Environment limitedView={true} />
              </IonCol>
            </IonRow>
          </IonGrid>
          <SquatChart />
        </div>
      </SquatContext.Provider>
    </>
  );
};

export default SquatCalculator;
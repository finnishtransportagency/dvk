import React, { useMemo } from 'react';
import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { SquatChart, SquatReducer, initialState, SquatContext, InfoAccordion, Vessel, Environment } from 'squatlib';
import 'squatlib/dist/style.css';

type SquatCalculatorProps = {
  widePane?: boolean;
};

const SquatCalculator: React.FC<SquatCalculatorProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const path = [{ title: t('common.squat') }];
  const [state, dispatch] = React.useReducer(SquatReducer, initialState);
  const providerState = useMemo(() => ({
      state,
      dispatch,
    }), [state]);

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{t('common.squat')}</strong>
        </h2>
      </IonText>

      <div
        id="squatCalculatorContainer"
        className={'tabContent active show-print' + (widePane ? ' wide' : '')}
        data-testid="squatCalculatorContainer"
      >
        <SquatContext.Provider value={providerState}>
          <InfoAccordion />
          <IonGrid className="content">
            <IonRow>
              <IonCol size="12">
                <Vessel limitedView={true} />
              </IonCol>
              <IonCol size="12">
                <Environment limitedView={true} />
              </IonCol>
            </IonRow>
          </IonGrid>
          <SquatChart />
        </SquatContext.Provider>
      </div>
    </>
  );
};

export default SquatCalculator;

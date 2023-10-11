import React, { useMemo } from 'react';
import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import {
  SquatChart,
  SquatReducer,
  initialStateEmbedded,
  SquatContext,
  InfoAccordion,
  Vessel,
  Environment,
  CalculationOptions,
  CalculationChecks,
  PrintBar,
} from 'squatlib';
import 'squatlib/dist/style.css';
import './SquatCalculator.css';
import { Lang } from '../../utils/constants';

type SquatCalculatorProps = {
  widePane?: boolean;
};

const SquatCalculator: React.FC<SquatCalculatorProps> = ({ widePane }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const path = [{ title: t('common.squat') }];
  const [state, dispatch] = React.useReducer(SquatReducer, initialStateEmbedded);
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

      <SquatContext.Provider value={providerState}>
        <IonGrid className="ion-no-padding ion-margin-top">
          <IonRow>
            <IonCol>
              <IonText className="fairwayTitle" id="mainPageContent">
                <h2 className="ion-no-margin">
                  <strong>{t('common.squat')}</strong>
                </h2>
              </IonText>
            </IonCol>
            <IonCol size="auto" className="ion-align-self-end printBar">
              <PrintBar />
            </IonCol>
          </IonRow>
          <IonRow className="no-print">
            <IonCol>
              <IonText className="fairwayTitle">
                <a
                  href={'/squat/' + (window.location.search ? window.location.search + '&lang=' + lang : '?lang=' + lang)}
                  rel="noreferrer"
                  target="_blank"
                  className="ion-no-padding external"
                >
                  {t('common.extensive-squat')}
                  <span className="screen-reader-only">{t('common.opens-in-a-new-tab')}</span>
                </a>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>

        <div id="squatCalculatorContainer" className="squatCalculatorContainer show-print" data-testid="squatCalculatorContainer">
          <InfoAccordion />
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol className="squat-checks">
                <CalculationChecks doChecks={['ukc', 'reliability', 'LBratio', 'BDratio']} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size={widePane ? '6' : '12'} className="squatColumn first squat">
                <CalculationOptions />
                <Vessel />
              </IonCol>
              <IonCol size={widePane ? '6' : '12'} className="squatColumn last">
                <Environment />
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

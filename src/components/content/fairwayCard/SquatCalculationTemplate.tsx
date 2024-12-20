import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import React from 'react';
import { SquatCalculation } from '../../../graphql/generated';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../../utils/constants';
import { getFairwayFormText } from '../../../utils/common';
import { Link } from 'react-router-dom';

export type SquatCalculationProps = {
  squatCalculation?: SquatCalculation | null;
};

const SquatCalculationTemplate: React.FC<SquatCalculationProps> = ({ squatCalculation }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'squattemplates' });
  const lang = i18n.resolvedLanguage as Lang;
  return (
    <>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonText className="no-margin-top" data-testid="squatCalculationPlace">
              <h4>
                <strong>{squatCalculation?.place?.[lang]}</strong>
              </h4>
            </IonText>
          </IonCol>
          <IonCol>
            <IonText className="no-margin-top" data-testid="squatCalculationZoomToAreas">
              <p>{t('squat-calculation-zoom-to-areas')}</p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonText data-testid="depth">
        <h5>{t('squat-calculation-depth') + ':'}</h5>
        <p>{squatCalculation?.depth} m</p>
      </IonText>

      <IonText className="no-margin-top" data-testid="squatCalculationAreas">
        <h5>{t('squat-calculation-areas') + ':'}</h5>
      </IonText>
      {squatCalculation?.suitableFairwayAreas?.map((area, idx) => (
        <IonText data-testid="squatarea" key={area}>
          <p>
            {++idx}.{' ' + area}
          </p>
        </IonText>
      ))}

      <IonText className="no-margin-top" data-testid="squatCalculationEstimatedWaterDepth">
        <h5>{t('squat-calculation-estimated-water-depth') + ':'}</h5>
        <p>{squatCalculation?.estimatedWaterDepth} m</p>
      </IonText>

      <IonText className="no-margin-top" data-testid="fairwayForm">
        <h5>{t('squat-calculation-fairway-form') + ':'}</h5>
        <p>{getFairwayFormText(squatCalculation?.fairwayForm as number, t)}</p>
      </IonText>

      <IonText className="no-margin-top" data-testid="squatCalculationAdditionalInformation">
        <p>
          <strong>{t('squat-calculation-additional-information') + ': '}</strong>
          {squatCalculation?.additionalInformation?.[lang]}
        </p>
      </IonText>

      <IonText className="no-margin-top" data-testid="openSquatLink">
        <Link to="/squat" target="_blank" rel="noopener noreferrer">
          <p>{t('squat-calculation-open-link')}</p>
        </Link>
      </IonText>
    </>
  );
};

export default SquatCalculationTemplate;

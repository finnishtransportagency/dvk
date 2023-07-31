import React, {  } from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';

type SquatCalculatorProps = {
  widePane?: boolean;
};

const SquatCalculator: React.FC<SquatCalculatorProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const path = [{ title: t('common.squat') }];

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
      />
    </>
  );
};

export default SquatCalculator;

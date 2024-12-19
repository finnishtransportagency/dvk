import React from 'react';
import '../theme/squat.css';
import '../theme/print.css';
import { IonGrid, IonRow, IonCol } from '@ionic/react';

import Calculations from './Calculations';
import Vessel from './Vessel';
import Environment from './Environment';
import TitleBar from './TitleBar';
import InfoAccordion from './InfoAccordion';
import Alert from './Alert';
import { useTranslation } from 'react-i18next';

const Squat: React.FC = () => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squat' });
  return (
    <>
      <TitleBar />
      <InfoAccordion />
      <Alert className="page-top" alertType="info" title={t('pakolliset-kentat-info')} closable />
      <IonGrid className="content">
        <IonRow>
          <IonCol data-testid="vessel-column" size="12" sizeSm="6" sizeLg="4">
            <Vessel />
          </IonCol>

          <IonCol data-testid="environment-column" size="12" sizeSm="6" sizeLg="4">
            <Environment />
          </IonCol>

          <IonCol data-testid="calculations-column" size="12" sizeLg="4" className="block-in-print">
            <Calculations />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default Squat;

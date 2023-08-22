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
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.squat' });

  return (
    <>
      <TitleBar />
      <InfoAccordion />
      <Alert alertType="info" title={t('pakolliset-kentat-info')} closable />
      <IonGrid className="content">
        <IonRow>
          <IonCol size="12" sizeSm="6" sizeLg="4">
            <Vessel />
          </IonCol>

          <IonCol size="12" sizeSm="6" sizeLg="4">
            <Environment />
          </IonCol>

          <IonCol size="12" sizeLg="4">
            <Calculations />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default Squat;

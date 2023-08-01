import React from 'react';
import '../theme/squat.css';
import '../theme/print.css';
import { IonGrid, IonRow, IonCol } from '@ionic/react';

import Calculations from './Calculations';
import Vessel from './Vessel';
import Environment from './Environment';
import TitleBar from './TitleBar';
import InfoAccordion from './InfoAccordion';
import { useSquatContext } from '../hooks/squatContext';

const Squat: React.FC = () => {
  const { state } = useSquatContext();
  const { showLimitedView } = state.status;

  return (
    <>
      <TitleBar />
      <InfoAccordion />
      <IonGrid className="content">
        <IonRow>
          <IonCol size="12" sizeSm="6" sizeLg="4">
            <Vessel limitedView={showLimitedView} />
          </IonCol>

          <IonCol size="12" sizeSm="6" sizeLg="4">
            <Environment limitedView={showLimitedView} />
          </IonCol>

          <IonCol size="12" sizeLg="4">
            <Calculations limitedView={showLimitedView} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default Squat;

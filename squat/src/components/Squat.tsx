import React from 'react';
import './Squat.css';
import { IonGrid, IonRow, IonCol } from '@ionic/react';

import Calculations from './Calculations';
import Vessel from './Vessel';
import Environment from './Environment';
import TitleBar from './TitleBar';

const Squat: React.FC = () => {
  return (
    <>
      <TitleBar />

      <IonGrid>
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

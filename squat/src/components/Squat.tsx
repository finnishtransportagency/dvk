import React from 'react';
import './Squat.css';
import { useTranslation } from 'react-i18next';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { PinFormatter } from '@ionic/core/dist/types/components/range/range-interface';

import i18n from '../i18n';
import Calculations from './Calculations';
import Vessel from './Vessel';
import Environment from './Environment';
import TitleBar from './TitleBar';

// Initialize common formatters
export const percentFormatter: PinFormatter = (value: number) => `${value * 100}%`;
export const degreeFormatter: PinFormatter = (value: number) => `${value.toString().padStart(3, '0')}`;
export const decimalFormatter: PinFormatter = (value: number) =>
  `${value.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`;

const Squat: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <TitleBar />

      <IonGrid>
        <IonRow>
          <IonCol size-lg="4">
            <Vessel />
          </IonCol>

          <IonCol size-lg="4">
            <Environment />
          </IonCol>

          <IonCol size-lg="4">
            <Calculations />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default Squat;

import React from 'react';
import './Squat.css';
import { useTranslation } from "react-i18next";
import { IonText, IonGrid, IonRow, IonCol } from '@ionic/react';
import i18n from '../i18n';

import Calculations from './Calculations';
import Vessel from './Vessel';
import Environment from './Environment';

interface ContainerProps { }

// Initialize common formatters
export const percentFormatter = (value: number) => `${value}%`;
export const degreeFormatter = (value: number) => `${value}°`;
export const decimalFormatter = (value: number) => `${value.toLocaleString(i18n.language, {minimumFractionDigits: 1, maximumFractionDigits: 2})}`;

const Squat: React.FC<ContainerProps> = () => {
  const { t } = useTranslation();

  return (
    <>
      <IonText color="secondary">
        <h1>{t("homePage.squat.content")}</h1>
      </IonText>

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

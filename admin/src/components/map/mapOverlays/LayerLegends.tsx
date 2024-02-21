import React from 'react';
import { IonGrid, IonRow, IonCol, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import DepthMW from '../../../theme/img/syvyys_mw.svg?react';
import DepthN2000 from '../../../theme/img/syvyys_n2000.svg?react';

export const LegendDepth = () => {
  return (
    <IonGrid className="legend ion-no-padding">
      <IonRow>
        <IonCol size="2">
          <IonItem>
            <DepthN2000 />
          </IonItem>
        </IonCol>
        <IonCol size="3">
          <IonItem>
            <IonText>N2000</IonText>
          </IonItem>
        </IonCol>
        <IonCol size="2">
          <IonItem>
            <DepthMW />
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>MW</IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LegendSpeedlimits = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend speedlimit ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              30-26 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit30"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              25-21 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit25"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              20-16 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit20"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              15-11 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit15"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              10-6 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit10"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              5-1 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit5"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

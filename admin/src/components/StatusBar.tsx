import { IonCol, IonGrid, IonHeader, IonLabel, IonRow, IonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Status } from '../graphql/generated';

interface StatusBarProps {
  status: Status;
}

const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const { t } = useTranslation();

  return (
    <IonHeader className="statusHeader">
      <IonGrid className="statusContent ion-no-padding">
        <IonRow className="divider">
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-status')}</IonLabel>
            <IonText className={'item-status-' + status}>{t('general.item-status-' + status)}</IonText>
          </IonCol>
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-status')}</IonLabel>
            <IonText className={'item-status-' + status}>{t('general.item-status-' + status)}</IonText>
          </IonCol>
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-status')}</IonLabel>
            <IonText className={'item-status-' + status}>{t('general.item-status-' + status)}</IonText>
          </IonCol>
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-status')}</IonLabel>
            <IonText className={'item-status-' + status}>{t('general.item-status-' + status)}</IonText>
          </IonCol>
          <IonCol size="2">
            <IonLabel className="formLabel">{t('general.item-status')}</IonLabel>
            <IonText className={'item-status-' + status}>{t('general.item-status-' + status)}</IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default StatusBar;

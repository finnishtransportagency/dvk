import { IonCol, IonGrid, IonHeader, IonLabel, IonRow, IonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Status } from '../graphql/generated';

interface InfoHeaderProps {
  status: Status;
  modified: string;
  modifier: string | null | undefined;
  creator: string | null | undefined;
  created: string;
}

const InfoHeader: React.FC<InfoHeaderProps> = ({ status, modified, modifier, creator, created }) => {
  const { t } = useTranslation();

  return (
    <IonHeader className="infoHeader">
      <IonGrid className="infoContent">
        <IonRow className="infoHeaderRow infoHeaderDivider">
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-status')}</IonLabel>
            <IonText className={'item-status-' + status}>{t('general.item-status-' + status)}</IonText>
          </IonCol>
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-updated')}</IonLabel>
            <IonText>{modified}</IonText>
          </IonCol>
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-latest-updater')}</IonLabel>
            <IonText>{modifier ?? '-'}</IonText>
          </IonCol>
          <IonCol size="2.5">
            <IonLabel className="formLabel">{t('general.item-created-date')}</IonLabel>
            <IonText>{created}</IonText>
          </IonCol>
          <IonCol size="2">
            <IonLabel className="formLabel">{t('general.item-creator')}</IonLabel>
            <IonText>{creator ?? '-'}</IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default InfoHeader;

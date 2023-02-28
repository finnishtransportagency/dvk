import React from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lang } from '../utils/constants';

interface FairwayCardProps {
  fairwayCardId?: string;
}

const FairwayCardEditPage: React.FC<FairwayCardProps> = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;
  const { fairwayCardId } = useParams<FairwayCardProps>();

  return (
    <IonPage>
      <IonContent className="mainContent ion-no-padding" data-testid="fairwayCardEditPage">
        <IonGrid className="optionBar">
          <IonRow>
            <IonCol>
              <p>
                {t('fairwayCardId')}: {fairwayCardId} ({lang})
              </p>
            </IonCol>
            <IonCol size="auto">
              <IonButton shape="round" className="invert" routerLink="/">
                {t('cancel')}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardEditPage;

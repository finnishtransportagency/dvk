import React from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lang } from '../utils/constants';

interface HarbourProps {
  harbourId?: string;
}

const HarbourEditPage: React.FC<HarbourProps> = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;
  const { harbourId } = useParams<HarbourProps>();

  return (
    <IonPage>
      <IonContent className="mainContent ion-no-padding" data-testid="harbourEditPage">
        <IonGrid className="optionBar">
          <IonRow>
            <IonCol>
              <p>
                {t('harbourId')}: {harbourId} ({lang})
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

export default HarbourEditPage;

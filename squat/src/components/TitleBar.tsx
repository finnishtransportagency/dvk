import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { downloadOutline, printOutline, shareSocialOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

const TitleBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonText color="dark" className="equal-margin-top">
            <h1>
              <strong>{t('homePage.squat.content')}</strong>
            </h1>
          </IonText>
        </IonCol>
        <IonCol size="auto" className="ion-align-self-center">
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonIcon icon={shareSocialOutline} color="medium" size="large" />
              </IonCol>
              <IonCol>
                <IonIcon icon={downloadOutline} color="medium" size="large" />
              </IonCol>
              <IonCol>
                <IonIcon icon={downloadOutline} color="medium" size="large" className="flipped" />
              </IonCol>
              <IonCol>
                <IonIcon icon={printOutline} color="medium" size="large" />
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TitleBar;

import React from 'react';
import { IonAccordion, IonAccordionGroup, IonCol, IonGrid, IonItem, IonLabel, IonRow } from '@ionic/react';
import './InfoAccordion.css';
import { caretDownSharp } from 'ionicons/icons';
import { Trans, useTranslation } from 'react-i18next';

const InfoAccordion: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonAccordionGroup>
            <IonAccordion toggleIcon={caretDownSharp} toggleIconSlot="start">
              <IonItem slot="header" className="divider">
                <IonLabel>
                  <h3>
                    <strong>{t('info.title')}</strong>
                  </h3>
                </IonLabel>
              </IonItem>
              <IonItem>hei</IonItem>
              <div slot="content">
                <p>
                  <Trans i18nKey="info.description"></Trans>
                </p>
                <p>
                  <Trans i18nKey="info.thanks"></Trans>
                </p>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default InfoAccordion;

import React from 'react';
import { IonAccordion, IonAccordionGroup, IonCol, IonGrid, IonItem, IonLabel, IonRow } from '@ionic/react';
import './InfoAccordion.css';
import { caretDownSharp } from 'ionicons/icons';
import { Trans, useTranslation } from 'react-i18next';

const InfoAccordion: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonGrid className="info-accordion">
      <IonRow>
        <IonCol>
          <IonAccordionGroup>
            <IonAccordion toggleIcon={caretDownSharp}>
              <IonItem slot="header" className="accItem divider">
                <IonLabel>{t('info.title')}</IonLabel>
              </IonItem>
              <div className={'tabContent'} slot="content">
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

import React from 'react';
import { IonAccordion, IonAccordionGroup, IonCol, IonGrid, IonItem, IonLabel, IonRow, IonText } from '@ionic/react';
import './InfoAccordion.css';
import arrow_down from '../theme/img/arrow_down.svg';
import { Trans, useTranslation } from 'react-i18next';

const InfoAccordion: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonGrid className="info-accordion">
      <IonRow>
        <IonCol>
          <IonAccordionGroup>
            <IonAccordion toggleIcon={arrow_down}>
              <IonItem slot="header" className="accItem divider">
                <IonLabel>{t('info.title')}</IonLabel>
              </IonItem>
              <div className="tabContent active" slot="content">
                <IonText>
                  <p>
                    <Trans i18nKey="info.description"></Trans>
                  </p>
                  <p>
                    <Trans i18nKey="info.thanks"></Trans>
                  </p>
                </IonText>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default InfoAccordion;

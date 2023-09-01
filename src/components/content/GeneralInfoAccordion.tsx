import { IonLabel, IonText, IonAccordionGroup, IonAccordion, IonItem } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import arrow_down from '../../theme/img/arrow_down.svg';

type GeneralInfoAccordionProps = {
  description: string;
  additionalDesc?: string;
  notification?: string;
  widePane?: boolean;
};

const GeneralInfoAccordion: React.FC<GeneralInfoAccordionProps> = ({ description, additionalDesc, notification, widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const [showDescription, setShowDescription] = useState();

  return (
    <IonAccordionGroup onIonChange={(e) => setShowDescription(e.detail.value)}>
      <IonAccordion toggleIcon={arrow_down} color="lightest" value="1">
        <IonItem
          slot="header"
          color="lightest"
          className="accItem"
          title={showDescription ? t('closeDescription') : t('openDescription')}
          aria-label={showDescription ? t('closeDescription') : t('openDescription')}
        >
          <IonLabel>{t('general')}</IonLabel>
        </IonItem>
        <div className={'tabContent active show-print' + (widePane ? ' wide' : '')} slot="content">
          <IonText>
            <p>
              <strong>{description}</strong>
            </p>
            {additionalDesc && <p>{additionalDesc}</p>}
            {notification && (
              <p>
                <em>{notification}</em>
              </p>
            )}
          </IonText>
        </div>
      </IonAccordion>
    </IonAccordionGroup>
  );
};

export default GeneralInfoAccordion;

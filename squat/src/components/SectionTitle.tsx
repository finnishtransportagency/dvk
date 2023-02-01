import React, { ReactElement } from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { checkmarkCircle, radioButtonOff } from 'ionicons/icons';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import SquatHeader from './SquatHeader';
import { isEmbedded } from '../pages/Home';

interface SectionProps {
  title: string;
  valid?: boolean;
  hideValidity?: boolean;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
}

const SectionTitle: React.FC<SectionProps> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'common' });
  return (
    <IonGrid className="no-padding divider margin-top">
      <IonRow>
        <IonCol>
          <IonText color="dark" className="no-margin">
            <SquatHeader level={3} text={props.title} embedded={isEmbedded()}>
              {props.infoContent && props.infoContentTitle && <Modal title={props.infoContentTitle} content={props.infoContent} />}
            </SquatHeader>
          </IonText>
        </IonCol>
        {!props.hideValidity && (
          <IonCol size="auto" className="ion-align-self-center" title={props.valid ? t('section-valid') : t('section-invalid')}>
            <IonIcon
              icon={props.valid ? checkmarkCircle : radioButtonOff}
              color={props.valid ? 'success' : 'medium'}
              className="medium section-validation"
              aria-label={props.valid ? t('section-valid') : t('section-invalid')}
            />
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};

export default SectionTitle;

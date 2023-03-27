import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FairwayCard, FairwayCardInput, Status } from '../graphql/generated';
import { ReactComponent as CloseIcon } from '../theme/img/close_black_24dp.svg';
import { Lang } from '../utils/constants';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  action: () => void;
  oldState: FairwayCardInput | FairwayCard;
  newState: FairwayCardInput;
}

const ConfirmationModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, action, newState, oldState }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  let buttonTitle = t('general.save');
  let description = t('modal.save-public-card-description');
  let title = t('modal.save-public-card-title');
  const modal = useRef<HTMLIonModalElement>(null);
  if (newState.status === Status.Removed) {
    buttonTitle = t('general.delete');
    title = t('modal.delete-public-card-title');
    description = t('modal.delete-public-card-description', { name: oldState.name[lang] });
  } else if (oldState.status === Status.Public && newState.status === Status.Draft) {
    buttonTitle = t('general.update');
    title = t('modal.update-public-card-title');
    description = t('modal.update-public-card-description');
  } else if (oldState.status === Status.Removed && newState.status === Status.Draft) {
    buttonTitle = t('general.update');
    title = t('modal.update-public-card-title');
    description = t('modal.update2-public-card-description');
  } else if (oldState.status === Status.Draft && newState.status === Status.Public) {
    buttonTitle = t('general.update');
    title = t('modal.publish-public-card-title');
    description = t('modal.publish-public-card-description');
  }
  const closeModal = () => {
    setIsOpen(false);
    modal.current?.dismiss();
  };
  const buttonAction = () => {
    modal.current?.dismiss();
    action();
  };

  return (
    <IonModal ref={modal} isOpen={isOpen} className="prompt" onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{title}</div>
          </IonTitle>
          <IonButton
            slot="end"
            onClick={() => closeModal()}
            fill="clear"
            className="closeButton"
            title={t('general.close') || ''}
            aria-label={t('general.close') || ''}
          >
            <CloseIcon />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow className="content">
          <IonCol>
            <IonText>
              <p>{description}</p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" size="large" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" size="large" onClick={() => buttonAction()} shape="round">
            {buttonTitle}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ConfirmationModal;

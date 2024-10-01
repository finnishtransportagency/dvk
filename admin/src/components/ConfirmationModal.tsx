import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Maybe, Status, TextInput } from '../graphql/generated';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import { ConfirmationType, Lang } from '../utils/constants';

export type StatusName = {
  status?: Maybe<Status>;
  name: TextInput;
};

export type SaveType = 'fairwaycard' | 'harbor';

interface ModalProps {
  confirmationType: ConfirmationType;
  setConfirmationType: (isOpen: ConfirmationType) => void;
  action: (isRemove: boolean) => void;
  oldState: StatusName;
  newStatus: Status;
  saveType: SaveType;
  setActionPending: Dispatch<SetStateAction<boolean>>;
}

const ConfirmationModal: React.FC<ModalProps> = ({
  confirmationType,
  setConfirmationType,
  action,
  newStatus,
  oldState,
  saveType,
  setActionPending,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  const modal = useRef<HTMLIonModalElement>(null);
  let buttonTitle = t('general.save');
  let description = t(`modal.save-${saveType}-description`);
  let title = t(`modal.save-${saveType}-title`);

  if (confirmationType === 'cancel') {
    buttonTitle = t('general.leave');
    title = t(`modal.cancel-${saveType}-title`);
    description = t(`modal.cancel-${saveType}-description`);
  } else if (confirmationType === 'preview') {
    title = t(`modal.preview-${saveType}-title`);
    description = t(`modal.preview-${saveType}-description`);
  } else if (confirmationType === 'publish') {
    title = t(`modal.publish-${saveType}-title`);
    description = t(`modal.publish-${saveType}-description2`);
  } else if (confirmationType === 'remove' || newStatus === Status.Removed) {
    buttonTitle = t('general.delete');
    title = t(`modal.delete-${saveType}-title`);
    description = t(`modal.delete-${saveType}-description`, { name: oldState.name ? oldState.name[lang] : '-' });
  } else if (oldState.status === Status.Public && newStatus === Status.Draft) {
    buttonTitle = t('general.update');
    title = t(`modal.update-${saveType}-title`);
    description = t(`modal.update-${saveType}-description`);
  } else if (oldState.status === Status.Removed && newStatus === Status.Draft) {
    buttonTitle = t('general.update');
    title = t(`modal.update-${saveType}-title`);
    description = t(`modal.update2-${saveType}-description`);
  } else if (oldState.status === Status.Removed && newStatus === Status.Public) {
    buttonTitle = t('general.update');
    title = t(`modal.update-${saveType}-title`);
    description = t(`modal.update3-${saveType}-description`);
  } else if (oldState.status === Status.Draft && newStatus === Status.Public) {
    buttonTitle = t('general.update');
    title = t(`modal.publish-${saveType}-title`);
    description = t(`modal.publish-${saveType}-description`);
  }

  const closeModal = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    setTimeout(() => {
      setConfirmationType('');
    }, 150);
  };

  const cancelAction = () => {
    setActionPending(false);
    closeModal();
  };

  const buttonAction = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    action(confirmationType === 'remove' || newStatus === Status.Removed);
  };

  return (
    <IonModal ref={modal} isOpen={confirmationType !== ''} className="prompt" onDidDismiss={() => closeModal()}>
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
            title={t('general.close') ?? ''}
            aria-label={t('general.close') ?? ''}
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
          <IonButton slot="end" onClick={() => cancelAction()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" onClick={() => buttonAction()} shape="round">
            {buttonTitle}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ConfirmationModal;

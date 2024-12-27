import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FairwayCard, Maybe, Status, TextInput } from '../graphql/generated';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import { ConfirmationType, Lang } from '../utils/constants';
import { useHistory } from 'react-router';

export type StatusName = {
  status?: Maybe<Status>;
  id?: Maybe<string>;
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
  versionToMoveTo?: string;
  linkedFairwayCards?: FairwayCard[];
}

const ConfirmationModal: React.FC<ModalProps> = ({
  confirmationType,
  setConfirmationType,
  action,
  newStatus,
  oldState,
  saveType,
  setActionPending,
  versionToMoveTo,
  linkedFairwayCards,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const history = useHistory();

  const modal = useRef<HTMLIonModalElement>(null);
  let buttonTitle = t('general.save');
  let description = '';
  let title = '';

  if (confirmationType === 'cancel') {
    buttonTitle = t('general.leave');
    title = t(`modal.cancel-${saveType}-title`);
    description = t(`modal.cancel-${saveType}-description`);
  } else if (confirmationType === 'preview') {
    title = t(`modal.preview-${saveType}-title`);
    description = t(`modal.preview-${saveType}-description`);
  } else if (confirmationType === 'version') {
    title = t('general.create-new-version');
    description = t(`modal.version-${saveType}-description`);
  } else if (confirmationType === 'remove') {
    buttonTitle = t('general.delete');
    title = t(`modal.delete-${saveType}-title`);
    description = t(`modal.delete-${saveType}-description`, { name: oldState.name ? oldState.name[lang] : '-' });
  } else if (confirmationType === 'archive' && !!linkedFairwayCards?.length) {
    buttonTitle = t('general.archive');
    title = t('modal.archive-harbor-title-blocked');
    description = t('modal.archive-harbor-description-blocked');
  } else if (confirmationType === 'archive') {
    buttonTitle = t('general.archive');
    title = t(`modal.archive-${saveType}-title`);
    description = t(`modal.archive-${saveType}-description`, { name: oldState.name ? oldState.name[lang] : '-' });
  } else if (confirmationType === 'changeVersion') {
    title = t(`modal.unsaved-changes`);
    description = t(`modal.change-version-${saveType}-description`);
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

  // move to version without saving changes
  const moveToVersion = () => {
    if (versionToMoveTo) {
      const type = saveType === 'fairwaycard' ? '/vaylakortti/' : '/satama/';
      history.push({ pathname: type + oldState.id + '/' + versionToMoveTo });
      closeModal();
    }
  };

  return (
    <IonModal ref={modal} isOpen={confirmationType !== '' && confirmationType !== 'publish'} className="prompt" onDidDismiss={() => closeModal()}>
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
              <p>
                <Trans t={t} i18nKey={description} components={{ strong: <strong /> }} />
              </p>
              {!!linkedFairwayCards?.length && (
                <p>
                  <Trans
                    t={t}
                    i18nKey={t('modal.archive-harbor-linked-fairwayCards', { name: oldState.name ? oldState.name[lang] : '-' })}
                    components={{ strong: <strong /> }}
                  />
                  {linkedFairwayCards.map((f) => {
                    return (
                      <div style={{ marginTop: '5px' }} key={f.name.fi}>
                        -{f.name.fi}
                      </div>
                    );
                  })}
                </p>
              )}
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar" style={{ paddingLeft: '10px' }}>
          <IonButton slot="end" onClick={() => cancelAction()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          {confirmationType === 'changeVersion' && (
            <IonButton slot="end" shape="round" onClick={() => moveToVersion()}>
              {t('modal.discard')}
            </IonButton>
          )}
          <IonButton slot="end" onClick={() => buttonAction()} shape="round">
            {buttonTitle}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ConfirmationModal;

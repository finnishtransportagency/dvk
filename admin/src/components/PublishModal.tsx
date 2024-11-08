import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonFooter, IonGrid, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import { ActionType, ConfirmationType, Lang } from '../utils/constants';
import { FairwayCardInput, HarborInput, Status } from '../graphql/generated';
import InfoHeader from './InfoHeader';
import Textarea from './form/Textarea';

interface ModalProps {
  state: FairwayCardInput | HarborInput;
  setConfirmationType: (isOpen: ConfirmationType) => void;
  setModalOpen: (isOpen: boolean) => void;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  modalOpen: boolean;
  status: Status;
  modified: string;
  created: string;
  version?: string;
  modifier?: string;
  creator?: string;
}

const PublishModal: React.FC<ModalProps> = ({
  state,
  setConfirmationType,
  setModalOpen,
  setValue,
  modalOpen,
  status,
  modified,
  created,
  version,
  modifier,
  creator,
}) => {
  const { t } = useTranslation();

  const [error, setError] = useState<string>('');

  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    setModalOpen(false);
    modal.current?.dismiss().catch((err) => console.error(err));
  };

  const handlePublish = () => {
    if (state.publishDetails && state.publishDetails.length > 0) {
      setConfirmationType('publish');
    } else {
      setError(t('general.required-field'));
    }
  };

  useEffect(() => {
    if (state.publishDetails) {
      setError('');
    }
  }, [state.publishDetails]);

  return (
    <IonModal ref={modal} isOpen={modalOpen} className="publish-details" onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>{t('modal.adding-publish-details')}</IonTitle>
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
      <IonGrid className="formGrid infoHeaderGrid">
        <InfoHeader status={status} modified={modified} modifier={modifier} creator={creator} created={created} version={version} />
        <br />
        <br />
        <Textarea
          label={t('general.publishing-details')}
          val={state.publishDetails ?? ''}
          setValue={setValue}
          actionType="publishDetails"
          required={true}
          rows={5}
          error={error}
        />
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" onClick={() => handlePublish()} shape="round">
            {t('general.publish')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default PublishModal;

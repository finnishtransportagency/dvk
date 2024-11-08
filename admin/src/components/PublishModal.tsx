import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import { ActionType, Lang } from '../utils/constants';
import { FairwayCardInput, HarborInput } from '../graphql/generated';
import InfoHeader, { InfoHeaderProps } from './InfoHeader';
import Textarea from './form/Textarea';

interface PublishModalProps {
  state: FairwayCardInput | HarborInput;
  setModalOpen: (isOpen: boolean) => void;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  handleConfirmationSubmit: () => void;
  modalOpen: boolean;
  infoHeader: InfoHeaderProps;
}

const PublishModal: React.FC<PublishModalProps> = ({ state, setModalOpen, setValue, handleConfirmationSubmit, modalOpen, infoHeader }) => {
  const { t } = useTranslation();

  const [error, setError] = useState<string>('');
  // for checking if modal was dismissed without publishing
  const [published, setPublished] = useState(false);

  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    setModalOpen(false);
    // discard possible changes if card/harbor wasnt published so there's
    // no unnecessary confirmation modal popping up when 'Peruuta' button is pushed
    if (!published) {
      setValue('', 'publishDetails');
    }
    modal.current?.dismiss().catch((err) => console.error(err));
  };

  const handlePublish = () => {
    if (state.publishDetails && state.publishDetails.length > 0) {
      handleConfirmationSubmit();
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
      <div className="gradient-top" />
      <IonGrid className="formGrid publishDetailsGrid">
        <IonHeader>
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
            <IonRow className="publishDetailsRow">
              <IonText>{t(`modal.publish-fairwaycard-description`)}</IonText>
            </IonRow>
          </IonToolbar>
        </IonHeader>
        <div style={{ padding: '20px 20px 20px 20px' }}>
          <InfoHeader
            status={infoHeader.status}
            modified={infoHeader.modified}
            modifier={infoHeader.modifier}
            creator={infoHeader.creator}
            created={infoHeader.created}
            version={infoHeader.version}
          />
        </div>
        <IonRow className="publishDetailsRow">
          <Textarea
            label={t('general.publishing-details')}
            val={state.publishDetails ?? ''}
            setValue={setValue}
            actionType="publishDetails"
            required={true}
            rows={5}
            error={error}
          />
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton
            slot="end"
            onClick={() => {
              setPublished(true);
              handlePublish();
            }}
            shape="round"
          >
            {t('general.publish')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default PublishModal;

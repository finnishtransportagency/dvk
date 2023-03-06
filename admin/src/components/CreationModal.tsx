import React, { useRef, useState } from 'react';
import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardOrHarbor } from '../graphql/generated';
import { ItemType } from '../utils/constants';
import { ReactComponent as CloseIcon } from '../theme/img/close_black_24dp.svg';
import SearchInput from './SearchInput';
import { useHistory } from 'react-router';

interface ModalProps {
  itemList: FairwayCardOrHarbor[];
  itemType: ItemType;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreationModal: React.FC<ModalProps> = ({ itemList, itemType, isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const modal = useRef<HTMLIonModalElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [origin, setOrigin] = useState<FairwayCardOrHarbor | undefined>();

  const createNewItem = () => {
    modal.current?.dismiss();
    if (itemType === 'CARD') history.push({ pathname: '/vaylakortti/', state: { origin: origin } });
    if (itemType === 'HARBOR') history.push({ pathname: '/satama/', state: { origin: origin } });
  };

  const closeModal = () => {
    setIsOpen(false);
    modal.current?.dismiss();
    setTimeout(() => {
      if (!isDropdownOpen) setOrigin(undefined);
    }, 150);
  };

  return (
    <IonModal ref={modal} isOpen={isOpen} className="prompt" canDismiss={!isDropdownOpen} onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{t('modal.title-new-' + itemType)}</div>
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
              <p>{t('modal.description-new-' + itemType)}</p>
            </IonText>
            <SearchInput
              itemList={itemList.filter((item) => item.type === itemType) || []}
              selectedItem={origin}
              setSelectedItem={setOrigin}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" size="large" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" size="large" onClick={() => createNewItem()} shape="round">
            {t('modal.create-' + itemType)}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default CreationModal;

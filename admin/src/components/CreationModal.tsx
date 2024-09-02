import React, { useMemo, useRef, useState } from 'react';
import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonLabel, IonModal, IonRow, IonSelect, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardOrHarbor } from '../graphql/generated';
import { ItemType } from '../utils/constants';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import SearchInput from './SearchInput';
import { useHistory } from 'react-router';
import { FairwayCardOrHarborGroup } from '../utils/common';

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
  const [origin, setOrigin] = useState<FairwayCardOrHarborGroup>();
  //const [version, setVersion] = useState<FairwayCardOrHarbor | undefined>();

  const createNewItem = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    if (itemType === 'CARD') history.push({ pathname: '/vaylakortti/', state: { origin: origin } });
    if (itemType === 'HARBOR') history.push({ pathname: '/satama/', state: { origin: origin } });
  };

  const groupItemList = useMemo(() => {
    const filtered = itemList.filter((item) => item.type === itemType) || [];
    const groupedItems: FairwayCardOrHarborGroup[] = [];
    for (const item of filtered) {
      const group = groupedItems.find((g) => g.id === item.id);
      if (group) {
        group.items.push(item);
      } else {
        groupedItems.push({ id: item.id, items: [item] });
      }
    }
    console.log(groupedItems);
    return groupedItems;
  }, [itemList, itemType]);

  const closeModal = () => {
    setIsOpen(false);
    modal.current?.dismiss().catch((err) => console.error(err));
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
              <p>{t('modal.description-new-' + itemType)}</p>
            </IonText>
            <SearchInput
              itemList={groupItemList}
              selectedItem={origin}
              setSelectedItem={setOrigin}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonLabel className={`formLabel ion-margin-top${!origin ? ' disabled' : ''}`}>{t('general.version-number')}</IonLabel>
            <IonSelect
              className="selectInput"
              disabled={!origin}
              placeholder={t('general.choose')}
              interface="popover"
              multiple={true}
              interfaceOptions={{
                size: 'cover',
              }}
              labelPlacement="stacked"
              fill="outline"
            ></IonSelect>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" onClick={() => createNewItem()} shape="round">
            {t('modal.create-' + itemType)}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default CreationModal;

import React, { useMemo, useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonFooter,
  IonGrid,
  IonHeader,
  IonLabel,
  IonModal,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardOrHarbor } from '../graphql/generated';
import { ItemType, Lang, VERSION } from '../utils/constants';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import SearchInput from './SearchInput';
import { useHistory } from 'react-router';
import { FairwayCardOrHarborGroup, sortItemGroups } from '../utils/common';

interface ModalProps {
  itemList: FairwayCardOrHarbor[];
  itemType: ItemType;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreationModal: React.FC<ModalProps> = ({ itemList, itemType, isOpen, setIsOpen }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();

  const modal = useRef<HTMLIonModalElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [source, setSource] = useState<FairwayCardOrHarborGroup | undefined>();
  const [version, setVersion] = useState<FairwayCardOrHarbor | undefined>();

  const selectVersionRef = useRef<HTMLIonSelectElement>(null);

  const focusVersionSelect = () => {
    selectVersionRef.current?.click();
  };

  const createNewItem = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    if (itemType === 'CARD') history.push({ pathname: '/vaylakortti/', state: { origin: version } });
    if (itemType === 'HARBOR') history.push({ pathname: '/satama/', state: { origin: version } });
  };

  const groupedItemList = useMemo(() => {
    const lang = i18n.language as Lang;
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
    return sortItemGroups(groupedItems, lang);
  }, [i18n.language, itemList, itemType]);

  const closeModal = () => {
    setIsOpen(false);
    modal.current?.dismiss().catch((err) => console.error(err));
    setTimeout(() => {
      if (!isDropdownOpen) {
        setSource(undefined);
        setVersion(undefined);
      }
    }, 150);
  };

  const compareOptions = (o1: FairwayCardOrHarbor, o2: FairwayCardOrHarbor) => {
    return o1 && o2 ? o1.id === o2.id && o1.version === o2.version : o1 === o2;
  };

  const keyDownAction = (event: React.KeyboardEvent<HTMLIonSelectElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      focusVersionSelect();
    }
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
              itemList={groupedItemList}
              selectedItem={source}
              setSelectedItem={setSource}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              setVersion={setVersion}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonLabel className={`formLabel ion-margin-top${!source ? ' disabled' : ''}`} onClick={() => focusVersionSelect()}>
              {t('general.version-number')}
            </IonLabel>
            <IonSelect
              ref={selectVersionRef}
              className="selectInput"
              disabled={!source}
              placeholder={t('general.choose')}
              interface="popover"
              interfaceOptions={{
                className: 'version-select',
                size: 'cover',
              }}
              labelPlacement="stacked"
              fill="outline"
              tabIndex={source ? 0 : -1}
              value={version}
              onIonChange={(ev) => setVersion(ev.detail.value)}
              onKeyDown={(e) => keyDownAction(e)}
              compareWith={compareOptions}
            >
              {source?.items
                .filter((item) => item.version !== VERSION.PUBLIC && item.version !== VERSION.LATEST)
                .sort((a, b) => Number(b.version.slice(1)) - Number(a.version.slice(1)))
                .map((item) => {
                  return (
                    <IonSelectOption key={`${item.id}-${item.version}`} value={item}>
                      {`${item.version.slice(1)} (${t('general.item-status-' + item.status).toLocaleLowerCase()})`}
                    </IonSelectOption>
                  );
                })}
            </IonSelect>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" onClick={() => createNewItem()} shape="round" disabled={source && !version}>
            {t('modal.create-' + itemType)}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default CreationModal;

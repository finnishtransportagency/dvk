import React, { useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useFairwayCardsAndHarborsQueryData } from '../graphql/api';
import { ItemType, Lang } from '../utils/constants';
import { filterItemList } from '../utils/common';
import { useHistory } from 'react-router-dom';
import { ReactComponent as ArrowIcon } from '../theme/img/arrow_back.svg';
import CreationModal from '../components/CreationModal';

const MainPage: React.FC = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.language as Lang;
  const history = useHistory();

  const { data, isLoading } = useFairwayCardsAndHarborsQueryData();
  const groups = ['-', t('archipelagoSea'), t('gulfOfFinland'), t('gulfOfBothnia')];

  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [itemType, setItemType] = useState<ItemType>('');
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDescending, setSortDescending] = useState(false);
  const searchRef = useRef<HTMLIonInputElement>(null);

  const filteredItemList = filterItemList(data?.fairwayCardsAndHarbors, lang, searchQuery, itemTypes, sortBy, sortDescending);

  const changeAction = (val?: string | number | null) => {
    setSearchQuery(String(val));
  };
  const clearInput = () => {
    setSearchQuery('');
    searchRef.current?.setFocus();
  };
  const itemTypeSelection = (value: ItemType[]) => {
    setItemTypes(value);
  };
  const itemCreationAction = (selectedType: ItemType) => {
    setItemType(selectedType);
    setIsOpen(true);
  };

  const sortItemsBy = (param: string) => {
    setSortDescending(param !== sortBy ? false : !sortDescending);
    setSortBy(param);
  };

  const selectItem = (id: string, type: string) => {
    if (type === 'CARD') history.push('/vaylakortti/' + id);
    if (type === 'HARBOR') history.push('/satama/' + id);
  };
  const keyDownAction = (event: React.KeyboardEvent<HTMLIonRowElement>, id: string, type: string) => {
    if (event.key === 'Enter') selectItem(id, type);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonGrid className="optionBar">
          <IonRow>
            <IonCol size="auto">
              <div className="searchWrapper">
                <IonInput
                  className="searchBar"
                  placeholder={t('search-placeholder') || ''}
                  title={t('search-title') || ''}
                  value={searchQuery}
                  onIonChange={(e) => changeAction(e.detail.value)}
                  ref={searchRef}
                />
                <button
                  type="button"
                  className="input-clear-icon"
                  title={t('search-clear-title') || ''}
                  aria-label={t('search-clear-title') || ''}
                  onClick={clearInput}
                ></button>
              </div>
            </IonCol>
            <IonCol size="auto">
              <IonItem fill="outline" className="selectInput">
                <IonSelect
                  placeholder={t('select-type') || ''}
                  interface="popover"
                  multiple={true}
                  onIonChange={(ev) => itemTypeSelection(ev.detail.value)}
                  interfaceOptions={{
                    size: 'cover',
                    className: 'multiSelect',
                  }}
                >
                  <IonSelectOption value="CARD">{t('type-fairwaycard') || ''}</IonSelectOption>
                  <IonSelectOption value="HARBOR">{t('type-harbour') || ''}</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol></IonCol>
            <IonCol size="auto">
              <IonButton shape="round" onClick={() => itemCreationAction('HARBOR')}>
                {t('new-harbour')}
              </IonButton>
              <IonButton shape="round" onClick={() => itemCreationAction('CARD')}>
                {t('new-fairwaycard')}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonHeader>

      <IonContent className="mainContent ion-no-padding" data-testid="mainPageContent">
        <IonGrid className="itemList">
          <IonRow className="header ion-align-items-stretch">
            <IonCol size="2.5">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('name')}>
                {t('item-name')}
                {sortBy === 'name' && <ArrowIcon />}
              </IonButton>
            </IonCol>
            <IonCol size="1.5">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('type')}>
                {t('item-type')}
                {sortBy === 'type' && <ArrowIcon />}
              </IonButton>
            </IonCol>
            <IonCol size="1.5">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('area')}>
                {t('item-area')}
                {sortBy === 'area' && <ArrowIcon />}
              </IonButton>
            </IonCol>
            <IonCol size="1">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('referencelevel')}>
                {t('item-referencelevel')}
                {sortBy === 'referencelevel' && <ArrowIcon />}
              </IonButton>
            </IonCol>
            <IonCol size="1">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('status')}>
                {t('item-status')}
                {sortBy === 'status' && <ArrowIcon />}
              </IonButton>
            </IonCol>
            <IonCol size="1.5">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('creator')}>
                {t('item-creator')}
                {sortBy === 'creator' && <ArrowIcon />}
              </IonButton>
            </IonCol>
            <IonCol size="1.5">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('modifier')}>
                {t('item-modifier')}
                {sortBy === 'modifier' && <ArrowIcon />}
              </IonButton>
            </IonCol>
            <IonCol size="1.5">
              <IonButton fill="clear" className={'plainButton' + (sortDescending ? ' desc' : '')} onClick={() => sortItemsBy('modified')}>
                {t('item-modified')}
                {sortBy === 'modified' && <ArrowIcon />}
              </IonButton>
            </IonCol>
          </IonRow>
          {isLoading &&
            [1, 2, 3, 4, 5].map((val) => (
              <IonRow key={val}>
                <IonCol>
                  <IonSkeletonText />
                </IonCol>
              </IonRow>
            ))}
          {!isLoading &&
            filteredItemList.map((item) => {
              return (
                <IonRow
                  key={item.id + item.type}
                  tabIndex={0}
                  onClick={() => selectItem(item.id, item.type)}
                  onKeyDown={(e) => keyDownAction(e, item.id, item.type)}
                >
                  <IonCol size="2.5">{item.name[lang] || item.name.fi}</IonCol>
                  <IonCol size="1.5">{t('item-type-' + item.type)}</IonCol>
                  <IonCol size="1.5">{groups[Number(item.group || 0)]}</IonCol>
                  <IonCol size="1">{item.n2000HeightSystem ? 'N2000' : 'MW'}</IonCol>
                  <IonCol size="1">{t('item-status-' + item.status)}</IonCol>
                  <IonCol size="1.5">{item.creator}</IonCol>
                  <IonCol size="1.5">{item.modifier}</IonCol>
                  <IonCol size="1.5">{t('datetimeFormat', { val: item.modificationTimestamp })}</IonCol>
                </IonRow>
              );
            })}
        </IonGrid>

        <CreationModal itemList={data?.fairwayCardsAndHarbors || []} itemType={itemType} isOpen={isOpen} setIsOpen={setIsOpen} />
      </IonContent>
    </IonPage>
  );
};

export default MainPage;

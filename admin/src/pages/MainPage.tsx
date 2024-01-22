import React, { useCallback, useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
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
import ArrowIcon from '../theme/img/arrow_back.svg?react';
import CreationModal from '../components/CreationModal';
import ClearSearchButton from '../components/ClearSearchButton';
import { getMap } from '../components/map/DvkMap';

type HeaderButtonProps = {
  headername: string;
  text: string;
  sortBy: string;
  headerButtonClassName: () => string;
  sortItemsBy: (param: string) => void;
};
const HeaderButton: React.FC<HeaderButtonProps> = ({ headername, text, sortBy, headerButtonClassName, sortItemsBy }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });
  return (
    <IonButton fill="clear" className={headerButtonClassName()} onClick={() => sortItemsBy(headername)}>
      {t(text)}
      {sortBy === headername && <ArrowIcon />}
    </IonButton>
  );
};

const MainPage: React.FC = () => {
  getMap().currentExtent = null;
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

  const filteredItemList = filterItemList(data?.fairwayCardsAndHarbors, lang, searchQuery, itemTypes, sortBy, sortDescending, t);

  const changeAction = (val?: string | number | null) => {
    setSearchQuery(String(val));
  };
  const clearInput = () => {
    setSearchQuery('');
    searchRef.current?.setFocus().catch((err) => console.error(err));
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

  const translatedTextOrEmpty = useCallback(
    (text: string) => {
      return t(text) || '';
    },
    [t]
  );

  const headerButtonClassName = useCallback(() => {
    return 'plainButton' + (sortDescending ? ' desc' : '');
  }, [sortDescending]);

  const selectTypeRef = useRef<HTMLIonSelectElement>(null);
  const focusTypeSelect = () => {
    selectTypeRef.current?.click();
  };

  const searchHasInput = searchQuery.length > 0;

  return (
    <IonPage>
      <IonHeader className="ion-no-border" id="mainPageContent">
        <IonGrid className="optionBar">
          <IonRow className="ion-align-items-end">
            <IonCol size="auto">
              <div className="searchWrapper">
                <IonItem lines="none" className={'searchBar'}>
                  <IonInput
                    className="searchBar"
                    placeholder={translatedTextOrEmpty('search-placeholder')}
                    title={translatedTextOrEmpty('search-title')}
                    value={searchQuery}
                    onIonChange={(e) => changeAction(e.detail.value)}
                    ref={searchRef}
                  />
                  <ClearSearchButton clearInput={clearInput} disabled={!searchHasInput} />
                </IonItem>
              </div>
            </IonCol>
            <IonCol size="auto">
              <IonLabel className="formLabel" onClick={() => focusTypeSelect()}>
                {translatedTextOrEmpty('label-type')}
              </IonLabel>
              <IonItem className="selectInput">
                <IonSelect
                  ref={selectTypeRef}
                  placeholder={translatedTextOrEmpty('choose')}
                  interface="popover"
                  multiple={true}
                  onIonChange={(ev) => itemTypeSelection(ev.detail.value)}
                  interfaceOptions={{
                    size: 'cover',
                    className: 'multiSelect',
                  }}
                  labelPlacement="stacked"
                >
                  <IonSelectOption value="CARD">{translatedTextOrEmpty('type-fairwaycard')}</IonSelectOption>
                  <IonSelectOption value="HARBOR">{translatedTextOrEmpty('type-harbour')}</IonSelectOption>
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
              <HeaderButton
                headername="name"
                text="item-name"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.5">
              <HeaderButton
                headername="type"
                text="item-type"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.5">
              <HeaderButton
                headername="area"
                text="item-area"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1">
              <HeaderButton
                headername="referencelevel"
                text="item-referencelevel"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1">
              <HeaderButton
                headername="status"
                text="item-status"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.5">
              <HeaderButton
                headername="creator"
                text="item-creator"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.5">
              <HeaderButton
                headername="modifier"
                text="item-modifier"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.5">
              <HeaderButton
                headername="modified"
                text="item-modified"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
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
                  <IonCol size="2.5">{item.name[lang] ?? item.name.fi}</IonCol>
                  <IonCol size="1.5">{t('item-type-' + item.type)}</IonCol>
                  <IonCol size="1.5">{groups[Number(item.group ?? 0)]}</IonCol>
                  <IonCol size="1">{item.n2000HeightSystem ? 'N2000' : 'MW'}</IonCol>
                  <IonCol size="1" className={'item-status-' + item.status}>
                    {t('item-status-' + item.status)}
                  </IonCol>
                  <IonCol size="1.5">{item.creator}</IonCol>
                  <IonCol size="1.5">{item.modifier}</IonCol>
                  <IonCol size="1.5">{t('datetimeFormat', { val: item.modificationTimestamp })}</IonCol>
                </IonRow>
              );
            })}
        </IonGrid>

        <CreationModal itemList={data?.fairwayCardsAndHarbors ?? []} itemType={itemType} isOpen={isOpen} setIsOpen={setIsOpen} />
      </IonContent>
    </IonPage>
  );
};

export default MainPage;

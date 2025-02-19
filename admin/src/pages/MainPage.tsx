import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  IonProgressBar,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ItemType, Lang } from '../utils/constants';
import { featureCollectionToAreaSelectOptions, filterItemList, getNotificationListingTypeString } from '../utils/common';
import { useHistory } from 'react-router-dom';
import ArrowIcon from '../theme/img/arrow_back.svg?react';
import CreationModal from '../components/CreationModal';
import ClearSearchButton from '../components/ClearSearchButton';
import { SquatCalculation, Status, TemporaryNotification } from '../graphql/generated';
import { useFairwayCardsAndHarborsQueryData } from '../graphql/api';
import { useFeatureData } from '../utils/dataLoader';
import { getOrphanedAreaString } from '../utils/squatCalculationUtils';

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
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.language as Lang;
  const history = useHistory();

  const { data, isLoading } = useFairwayCardsAndHarborsQueryData(true);
  const { data: areaList, isLoading: isLoadingAreas } = useFeatureData('area12');

  const groups = ['-', t('archipelagoSea'), t('gulfOfFinland'), t('gulfOfBothnia')];

  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [itemStatus, setItemStatus] = useState<Status[]>([Status.Public, Status.Draft]);
  const [itemType, setItemType] = useState<ItemType>('');
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDescending, setSortDescending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const searchRef = useRef<HTMLIonInputElement>(null);
  const filteredItemList = filterItemList(data?.fairwayCardsAndHarbors, lang, searchQuery, itemTypes, itemStatus, { sortBy, sortDescending }, t);
  const [navigationAreaIds, setNavigationAreaIds] = useState<number[]>([]);

  useEffect(() => {
    setNavigationAreaIds(
      featureCollectionToAreaSelectOptions(areaList, 'fairwaycard.calculation-depth', lang)
        .filter((a) => a.areatype === 1)
        .map((a) => a.id as number)
    );
  }, [isLoadingAreas, areaList, lang]);

  const changeAction = (val?: string | number | null) => {
    setSearchQuery(String(val));
  };

  const clearInput = () => {
    setSearchQuery('');
    searchRef.current?.setFocus().catch((err) => console.error(err));
  };

  const itemCreationAction = (selectedType: ItemType) => {
    setItemType(selectedType);
    setIsOpen(true);
  };

  const sortItemsBy = (param: string) => {
    setSortDescending(param !== sortBy ? false : !sortDescending);
    setSortBy(param);
  };

  const selectItem = (id: string, type: string, version: string) => {
    if (type === 'CARD') history.push('/vaylakortti/' + id + '/' + version);
    if (type === 'HARBOR') history.push('/satama/' + id + '/' + version);
  };

  const keyDownAction = (event: React.KeyboardEvent<HTMLIonRowElement>, id: string, type: string, version: string) => {
    if (event.key === 'Enter') selectItem(id, type, version);
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

  const selectStatusRef = useRef<HTMLIonSelectElement>(null);
  const focusStatusSelect = () => {
    selectStatusRef.current?.click();
  };

  const compareStatusOptions = (o1: Status, o2: Status): boolean => {
    return o1 && o2 ? o1.valueOf() === o2.valueOf() : o1 === o2;
  };

  const searchHasInput = searchQuery.length > 0;

  return (
    <IonPage>
      <IonHeader className="ion-no-border" id="mainPageContent">
        {isCreating && <IonProgressBar type="indeterminate" aria-hidden="true" />}
        <IonGrid className="optionBar">
          <IonRow className="ion-align-items-end">
            <IonCol size="auto">
              <div className="searchWrapper">
                <IonItem lines="none" className="searchBar">
                  <IonInput
                    className="searchBar"
                    placeholder={translatedTextOrEmpty('search-placeholder-mainPage')}
                    title={translatedTextOrEmpty('search-title-mainPage')}
                    value={searchQuery}
                    onIonInput={(e) => changeAction(e.detail.value)}
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
              <IonSelect
                ref={selectTypeRef}
                className="selectInput"
                placeholder={translatedTextOrEmpty('choose')}
                interface="popover"
                multiple={true}
                onIonChange={(ev) => setItemTypes(ev.detail.value)}
                interfaceOptions={{
                  size: 'cover',
                  className: 'multiSelect',
                }}
                labelPlacement="stacked"
                fill="outline"
              >
                <IonSelectOption value="CARD">{translatedTextOrEmpty('type-fairwaycard')}</IonSelectOption>
                <IonSelectOption value="HARBOR">{translatedTextOrEmpty('type-harbour')}</IonSelectOption>
              </IonSelect>
            </IonCol>
            <IonCol size="auto">
              <IonLabel className="formLabel" onClick={() => focusStatusSelect()}>
                {translatedTextOrEmpty('item-status')}
              </IonLabel>
              <IonSelect
                ref={selectStatusRef}
                className="selectInput"
                placeholder={translatedTextOrEmpty('choose')}
                interface="popover"
                multiple={true}
                value={itemStatus}
                compareWith={compareStatusOptions}
                onIonChange={(ev) => setItemStatus(ev.detail.value)}
                interfaceOptions={{
                  size: 'cover',
                  className: 'multiSelect',
                }}
                labelPlacement="stacked"
                fill="outline"
              >
                <IonSelectOption value={Status.Public}>{translatedTextOrEmpty('item-status-PUBLIC')}</IonSelectOption>
                <IonSelectOption value={Status.Draft}>{translatedTextOrEmpty('item-status-DRAFT')}</IonSelectOption>
                <IonSelectOption value={Status.Archived}>{translatedTextOrEmpty('item-status-ARCHIVED')}</IonSelectOption>
                <IonSelectOption value={Status.Removed}>{translatedTextOrEmpty('item-status-REMOVED')}</IonSelectOption>
              </IonSelect>
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
            <IonCol size="1">
              <HeaderButton
                headername="identifier"
                text="item-identifier"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.25">
              <HeaderButton
                headername="name"
                text="item-name"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1">
              <HeaderButton
                headername="type"
                text="item-type"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.25">
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
            <IonCol size="1">
              <HeaderButton
                headername="modified"
                text="item-updated"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.25">
              <HeaderButton
                headername="modifier"
                text="item-latest-updater"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1.25">
              <HeaderButton
                headername="creator"
                text="item-creator"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1">
              <HeaderButton
                headername="notice"
                text="temporary-notifications"
                sortBy={sortBy}
                headerButtonClassName={headerButtonClassName}
                sortItemsBy={sortItemsBy}
              />
            </IonCol>
            <IonCol size="1">
              <HeaderButton
                headername="version"
                text="version-number"
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
              const notificationString = getNotificationListingTypeString(item.temporaryNotifications as TemporaryNotification[]);
              const orphanedString = getOrphanedAreaString(item.squatCalculations as SquatCalculation[], navigationAreaIds, t);
              return (
                <IonRow
                  data-testid="resultrow"
                  key={item.id + item.type + item.version}
                  tabIndex={0}
                  onClick={() => selectItem(item.id, item.type, item.version)}
                  onKeyDown={(e) => keyDownAction(e, item.id, item.type, item.version)}
                >
                  <IonCol size="1">{item.id}</IonCol>
                  <IonCol data-testid="resultname" size="1.25">
                    {item.name[lang] ?? item.name.fi}
                  </IonCol>
                  <IonCol data-testid="resulttype" size="1">
                    {t('item-type-' + item.type)}
                  </IonCol>
                  <IonCol size="1.25">{groups[Number(item.group ?? 0)]}</IonCol>
                  <IonCol data-testid="n2000" size="1">
                    {item.n2000HeightSystem ? 'N2000' : 'MW'}
                  </IonCol>
                  <IonCol data-testid="resultstatus" size="1" className={'item-status-' + item.status}>
                    {t('item-status-' + item.status)}
                  </IonCol>
                  <IonCol size="1">{t('datetimeFormat', { val: item.modificationTimestamp })}</IonCol>
                  <IonCol size="1.25">{item.modifier}</IonCol>
                  <IonCol size="1.25">{item.creator}</IonCol>
                  <IonCol size="1">
                    {notificationString.length === 0 && orphanedString.length === 0 ? '-' : notificationString}
                    {notificationString.length > 0 && orphanedString.length > 0 ? ', ' : ''}
                    <IonText className="squat list warning">{orphanedString}</IonText>
                  </IonCol>
                  <IonCol data-testid="resultversion" size="1">
                    {item.version.slice(1)}
                  </IonCol>
                </IonRow>
              );
            })}
        </IonGrid>

        <CreationModal
          itemList={data?.fairwayCardsAndHarbors ?? []}
          itemType={itemType}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setIsCreating={setIsCreating}
        />
      </IonContent>
    </IonPage>
  );
};

export default MainPage;

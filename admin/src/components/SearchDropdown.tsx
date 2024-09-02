import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../utils/constants';
import { FairwayCardOrHarborGroup, getDefiningVersionName } from '../utils/common';

interface DropdownProps {
  isOpen: boolean;
  searchQuery: string;
  itemList: FairwayCardOrHarborGroup[];
  selected?: number;
  setSelectedItem: (item: FairwayCardOrHarborGroup | undefined) => void;
}

const SearchDropdown: React.FC<DropdownProps> = ({ isOpen, searchQuery, itemList, selected, setSelectedItem }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const checkSelected = (idx: number) => {
    return selected === idx ? ' ion-focused' : '';
  };

  return (
    <>
      {isOpen && (
        <IonList lines="none" className="searchInputDropdownContainer ion-no-padding">
          {itemList.map((item, idx) => {
            return (
              <IonItem key={item.id} className={'item' + checkSelected(idx)} button onClick={() => setSelectedItem(item)}>
                <IonLabel>{getDefiningVersionName(item.items, lang)}</IonLabel>
              </IonItem>
            );
          })}
          {itemList.length < 1 && (
            <IonItem className="item">
              <IonLabel>{t('no-results', { query: searchQuery })}</IonLabel>
            </IonItem>
          )}
        </IonList>
      )}
    </>
  );
};

export default SearchDropdown;

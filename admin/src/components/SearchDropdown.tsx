import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang, VERSION } from '../utils/constants';
import { FairwayCardOrHarbor } from '../graphql/generated';
import { FairwayCardOrHarborGroup } from '../utils/common';

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

  const getLabel = (items: FairwayCardOrHarbor[]) => {
    // Use name from version: 1. public 2.latest 3.first from list (precaution)
    const item = items.find((val) => val.version === VERSION.PUBLIC) ?? items.find((val) => val.version === VERSION.LATEST);
    return item ? (item?.name[lang] ?? item?.name.fi) : (items[0].name[lang] ?? items[0].name.fi);
  };

  return (
    <>
      {isOpen && (
        <IonList lines="none" className="searchInputDropdownContainer ion-no-padding">
          {itemList.map((item, idx) => {
            return (
              <IonItem key={item.id} className={'item' + checkSelected(idx)} button onClick={() => setSelectedItem(item)}>
                <IonLabel>{getLabel(item.items)}</IonLabel>
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

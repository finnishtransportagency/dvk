import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../utils/constants';
import { FairwayCardOrHarbor } from '../graphql/generated';

interface DropdownProps {
  isOpen: boolean;
  searchQuery: string;
  items: FairwayCardOrHarbor[];
  selected?: number;
  setSelectedItem: (item: FairwayCardOrHarbor) => void;
}

const SearchDropdown: React.FC<DropdownProps> = ({ isOpen, searchQuery, items, selected, setSelectedItem }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const checkSelected = (idx: number) => {
    return selected === idx ? ' ion-focused' : '';
  };

  return (
    <>
      {isOpen && (
        <IonList lines="none" className="searchInputDropdownContainer ion-no-padding">
          {items.map((item, idx) => {
            return (
              <IonItem key={item.id} className={'item' + checkSelected(idx + 1)} button onClick={() => setSelectedItem(item)}>
                <IonLabel>{item.name[lang] ?? item.name.fi}</IonLabel>
              </IonItem>
            );
          })}
          {(!items || (items && items.length < 1)) && (
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

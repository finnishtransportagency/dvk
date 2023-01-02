import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './SearchbarDropdown.css';
import { FairwayCardPartsFragment } from '../../graphql/generated';
import { Lang, MINIMUM_QUERYLENGTH } from '../../utils/constants';

interface DropdownProps {
  isOpen: boolean;
  searchQuery: string;
  fairwayCards: FairwayCardPartsFragment[];
  selected?: number;
}

const SearchbarDropdown: React.FC<DropdownProps> = ({ isOpen, searchQuery, fairwayCards, selected }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.map.controls.searchbar' });
  const lang = i18n.resolvedLanguage as Lang;
  const sortedCards = fairwayCards.sort((a, b) => {
    const nameA = a.name[lang] || '';
    const nameB = b.name[lang] || '';
    return nameA.localeCompare(nameB);
  });

  const checkSelected = (idx: number) => {
    return selected === idx ? ' ion-focused' : '';
  };

  return (
    <>
      {isOpen && searchQuery.length >= MINIMUM_QUERYLENGTH && (
        <IonList lines="none" className="searchbarDropdownContainer">
          {sortedCards.map((fairwayCard, idx) => {
            return (
              <IonItem
                key={fairwayCard.id}
                className={'fairwayCards' + checkSelected(idx + 1)}
                routerLink={'/vaylakortit/' + fairwayCard.id}
                data-testid="cardOption"
              >
                <IonLabel>{fairwayCard.name[lang]}</IonLabel>
              </IonItem>
            );
          })}
          {(!fairwayCards || (fairwayCards && fairwayCards.length < 1)) && (
            <IonItem className="fairwayCards">
              <IonLabel>{t('no-search-results', { query: searchQuery })}</IonLabel>
            </IonItem>
          )}
        </IonList>
      )}
    </>
  );
};

export default SearchbarDropdown;

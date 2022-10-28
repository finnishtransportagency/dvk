import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './SearchbarDropdown.css';
import { useFindAllFairwayCardsQuery } from '../../graphql/generated';

const MINIMUM_QUERYLENGTH = 3;
const MAX_HITS = 20;

interface DropdownProps {
  isOpen: boolean;
  searchQuery: string;
}

const SearchbarDropdown: React.FC<DropdownProps> = ({ isOpen, searchQuery }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.map.controls.searchbar' });
  const { data } = useFindAllFairwayCardsQuery();
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';

  const selectFairway = (fairway: string) => {
    // TODO: Set fairway to state?
    console.info(data?.fairwayCards.filter((card) => card.id === fairway));
  };

  const filterFairways = () => {
    return data?.fairwayCards.filter((card) => (card.name[lang] || '').toString().toLowerCase().indexOf(searchQuery) > -1).slice(0, MAX_HITS) || [];
  };

  return (
    <>
      {isOpen && searchQuery.length >= MINIMUM_QUERYLENGTH && (
        <IonList lines="none" id="searchbarDropdownContainer">
          {filterFairways().map((fairwayCard) => {
            return (
              <IonItem
                key={fairwayCard.id}
                className="fairwayCards"
                routerLink={'./vaylakortit/' + fairwayCard.id}
                onClick={() => selectFairway(fairwayCard.id)}
              >
                <IonLabel>{fairwayCard.name[lang]}</IonLabel>
              </IonItem>
            );
          })}
          {filterFairways().length < 1 && (
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

import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './SearchbarDropdown.css';
import { FairwayCardPartsFragment } from '../../graphql/generated';
import { Lang, MINIMUM_QUERYLENGTH } from '../../utils/constants';
import { isDigitsOnly } from '../../utils/common';

interface DropdownProps {
  isOpen: boolean;
  searchQuery: string;
  fairwayCards: FairwayCardPartsFragment[];
  selected?: number;
}

const SearchbarDropdown: React.FC<DropdownProps> = ({ isOpen, searchQuery, fairwayCards, selected }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.map.controls.searchbar' });
  const lang = i18n.resolvedLanguage as Lang;

  const checkSelected = (idx: number) => {
    return selected === idx ? ' ion-focused' : '';
  };

  return (
    <>
      {isOpen && (searchQuery.length >= MINIMUM_QUERYLENGTH || isDigitsOnly(searchQuery)) && (
        <IonList lines="none" className="searchbarDropdownContainer ion-no-padding">
          {fairwayCards.map((fairwayCard, idx) => {
            const fairwayIds = fairwayCard.fairways?.map((ff) => ff.id).join(', ');
            return (
              <IonItem
                key={fairwayCard.id}
                className={'fairwayCards' + checkSelected(idx + 1)}
                routerLink={'/kortit/' + fairwayCard.id}
                data-testid="cardOption"
              >
                <IonLabel>
                  {fairwayCard.name[lang]}&nbsp;{'(' + fairwayIds + ')'}
                </IonLabel>
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

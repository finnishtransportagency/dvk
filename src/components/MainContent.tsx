import React, { useRef, useState } from 'react';
import { IonCol, IonContent, IonGrid, IonInput, IonPage, IonRow, useIonViewWillEnter } from '@ionic/react';
import { ReactComponent as ChevronIcon } from '../theme/img/chevron.svg';
import { ReactComponent as MenuIcon } from '../theme/img/menu.svg';
import { menuController } from '@ionic/core/components';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { RouteComponentProps } from 'react-router-dom';
import FairwayCards from './FairwayCards';
import FairwayCard from './FairwayCard';
import dvkMap from '../components/DvkMap';
import SearchbarDropdown from './mapOverlays/SearchbarDropdown';
import { useFindAllFairwayCardsQuery } from '../graphql/generated';
import { MAX_HITS, MINIMUM_QUERYLENGTH } from '../utils/constants';

interface RouterProps {
  fairwayId?: string;
}

interface MainContentProps extends RouteComponentProps<RouterProps> {
  splitPane?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ match, history, splitPane }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  const { data } = useFindAllFairwayCardsQuery();

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const [widePane, setWidePane] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);

  const fairwayId = match.params.fairwayId;
  const curPath = history.location.pathname;

  const filterFairways = () => {
    return (
      data?.fairwayCards.filter((card) => (card.name[lang] || '').toString().toLowerCase().indexOf(searchQuery.trim()) > -1).slice(0, MAX_HITS) || []
    );
  };

  const closeDropdown = () => {
    setIsSearchbarOpen(false);
    const pathAfterClosing = history.location.pathname;
    if (curPath !== pathAfterClosing) setSearchQuery('');
  };
  const openDropdown = () => {
    setIsSearchbarOpen(true);
    setActiveSelection(0);
  };
  const changeAction = (val?: string | number | null) => {
    openDropdown();
    setSearchQuery(String(val)?.toLowerCase());
  };
  const blurAction = () => {
    setTimeout(closeDropdown, 200);
  };

  const keyDownAction = (event: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (event.key === 'Escape') closeDropdown();
    if (event.key === 'Tab' && isSearchbarOpen && searchQuery.trim().length >= MINIMUM_QUERYLENGTH) {
      event.preventDefault();
      setIsSearchbarOpen(false);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isSearchbarOpen && (event.target as HTMLInputElement).type !== 'button') {
        setIsSearchbarOpen(true);
      } else if (isSearchbarOpen && filterFairways().length > 0) {
        setActiveSelection(activeSelection >= filterFairways().length ? 1 : activeSelection + 1);
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSelection(activeSelection < 2 ? filterFairways().length : activeSelection - 1);
    }
    if (event.key === 'Enter' && isSearchbarOpen && activeSelection) {
      closeDropdown();
      const targetPath = '/vaylakortit/' + filterFairways()[activeSelection - 1].id;
      if (curPath !== targetPath) history.push('/vaylakortit/' + filterFairways()[activeSelection - 1].id);
    }
  };

  const clearInput = () => {
    setSearchQuery('');
    inputRef.current?.setFocus();
  };

  const togglePane = () => {
    setWidePane(!widePane);
  };

  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap?.removeShowSidebarMenuControl();
      dvkMap?.removeSearchbarControl();
      dvkMap?.setTarget(mapElement.current);
    }
  });

  return (
    <IonPage id="mainContent">
      <IonContent>
        <IonGrid className="ion-no-padding" id="splitPane">
          <IonRow>
            {splitPane && (
              <IonCol id="fairwayContent" className={widePane ? 'wide' : ''}>
                <IonContent id="fairwayCardsContainer">
                  <IonGrid className="ion-no-padding">
                    <IonRow className="ion-align-items-center">
                      <IonCol size="auto">
                        <button className="icon" onClick={() => menuController.open()}>
                          <MenuIcon />
                        </button>
                      </IonCol>
                      <IonCol className="ion-margin-start ion-margin-end">
                        <div className="dropdownWrapper">
                          <IonInput
                            className="searchBar"
                            placeholder={t('search')}
                            title={t('searchTitle')}
                            value={searchQuery}
                            onIonFocus={openDropdown}
                            onIonChange={(e) => changeAction(e.detail.value)}
                            onIonBlur={blurAction}
                            onKeyDown={(e) => keyDownAction(e)}
                            ref={inputRef}
                          />
                          <button
                            type="button"
                            className="input-clear-icon"
                            title={t('clearTitle')}
                            aria-label={t('clearTitle')}
                            onClick={clearInput}
                          ></button>
                          <SearchbarDropdown
                            isOpen={isSearchbarOpen}
                            searchQuery={searchQuery.trim()}
                            fairwayCards={filterFairways()}
                            selected={activeSelection}
                          />
                        </div>
                      </IonCol>
                      <IonCol size="auto">
                        <button className={'icon ' + (widePane ? 'flip invert' : '')} onClick={() => togglePane()}>
                          <ChevronIcon />
                        </button>
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  {fairwayId && <FairwayCard widePane={widePane} id={fairwayId} />}
                  {!fairwayId && <FairwayCards widePane={widePane} />}
                </IonContent>
              </IonCol>
            )}
            <IonCol id="mapPane">
              <IonContent className="ion-no-padding">
                <div ref={mapElement}></div>
              </IonContent>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MainContent;

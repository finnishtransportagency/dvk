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

const MAX_HITS = 20;

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

  const fairwayId = match.params.fairwayId;
  const curPath = history.location.pathname;

  const filterFairways = () => {
    return data?.fairwayCards.filter((card) => (card.name[lang] || '').toString().toLowerCase().indexOf(searchQuery) > -1).slice(0, MAX_HITS) || [];
  };

  const closeDropdown = () => {
    setIsSearchbarOpen(false);
    const pathAfterClosing = history.location.pathname;
    if (curPath !== pathAfterClosing) setSearchQuery('');
  };
  const openDropdown = (val?: string | number | null) => {
    setIsSearchbarOpen(true);
    setSearchQuery(String(val)?.toLowerCase());
    setActiveSelection(0);
  };
  const blurAction = () => {
    setTimeout(closeDropdown, 200);
  };

  const keyDownAction = (event: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (event.key === 'Escape') closeDropdown();
    if (event.key === 'Tab' && isSearchbarOpen) {
      event.preventDefault();
      setIsSearchbarOpen(false);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isSearchbarOpen) {
        setIsSearchbarOpen(true);
      } else if (filterFairways().length > 0) {
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
                            value={searchQuery}
                            onIonFocus={(e) => openDropdown(e.target.value)}
                            onIonChange={(e) => openDropdown(e.detail.value)}
                            onIonBlur={blurAction}
                            onKeyDown={(e) => keyDownAction(e)}
                          />
                          <SearchbarDropdown
                            isOpen={isSearchbarOpen}
                            searchQuery={searchQuery}
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

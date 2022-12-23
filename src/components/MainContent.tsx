import React, { useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonPage, IonRow, useIonViewWillEnter } from '@ionic/react';
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
import { Lang, MINIMUM_QUERYLENGTH } from '../utils/constants';
import { filterFairways } from '../utils/common';
import { unsetSelectedFairwayCard } from './layers';
import vayla_logo from '../theme/img/vayla_logo.png';

interface RouterProps {
  fairwayId?: string;
}

interface MainContentProps extends RouteComponentProps<RouterProps> {
  splitPane?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ match, history, splitPane }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { data } = useFindAllFairwayCardsQuery();

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const [widePane, setWidePane] = useState(false);
  const [showPane, setShowPane] = useState(true);
  const mapElement = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);

  const fairwayId = match.params.fairwayId;
  const curPath = history.location.pathname;

  const filteredFairways = filterFairways(data?.fairwayCards, lang, searchQuery);

  document.title = t('documentTitle');

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
      } else if (isSearchbarOpen && filteredFairways.length > 0) {
        setActiveSelection(activeSelection >= filteredFairways.length ? 1 : activeSelection + 1);
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSelection(activeSelection < 2 ? filteredFairways.length : activeSelection - 1);
    }
    if (event.key === 'Enter' && isSearchbarOpen && activeSelection) {
      closeDropdown();
      const targetPath = '/vaylakortit/' + filteredFairways[activeSelection - 1].id;
      if (curPath !== targetPath) history.push('/vaylakortit/' + filteredFairways[activeSelection - 1].id);
    }
  };

  const clearInput = () => {
    setSearchQuery('');
    inputRef.current?.setFocus();
  };

  const toggleWide = () => {
    setWidePane(!widePane);
  };
  const togglePane = () => {
    setShowPane(!showPane);
  };

  useIonViewWillEnter(() => {
    unsetSelectedFairwayCard();
    if (mapElement?.current) {
      dvkMap?.removeShowSidebarMenuControl();
      dvkMap?.removeSearchbarControl();
      dvkMap.addLayerPopupControl();
      dvkMap.addCenterToOwnLocationControl();
      dvkMap.addZoomControl();
      dvkMap?.setTarget(mapElement.current);
    }
  });

  return (
    <IonPage id="mainContent" data-testid={fairwayId ? 'fairwayCard' : 'fairwayList'}>
      <IonContent>
        <IonGrid className="ion-no-padding" id="splitPane">
          <IonRow>
            {splitPane && (
              <>
                <IonCol
                  id="fairwayContent"
                  className={(widePane ? 'wide' : '') + (showPane ? '' : ' hidden')}
                  data-testid={fairwayId ? 'cardPane' : 'listPane'}
                >
                  <IonContent id="fairwayCardsContainer">
                    <IonGrid className="ion-no-padding no-print">
                      <IonRow className="ion-align-items-center">
                        <IonCol size="auto">
                          <button
                            className="icon"
                            data-testid={fairwayId ? '' : 'menuController'}
                            onClick={() => menuController.open()}
                            title={t('openMenu')}
                            aria-label={t('openMenu')}
                          >
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
                              data-testid={fairwayId ? '' : 'searchInput'}
                            />
                            <button
                              type="button"
                              className="input-clear-icon"
                              title={t('clearTitle')}
                              aria-label={t('clearTitle')}
                              onClick={clearInput}
                              data-testid={fairwayId ? '' : 'clearInput'}
                            ></button>
                            <SearchbarDropdown
                              isOpen={isSearchbarOpen}
                              searchQuery={searchQuery.trim()}
                              fairwayCards={filteredFairways}
                              selected={activeSelection}
                            />
                          </div>
                        </IonCol>
                        <IonCol size="auto">
                          <button
                            className={'icon ' + (widePane ? 'flip invert' : '')}
                            data-testid={fairwayId ? '' : 'toggleWide'}
                            onClick={() => toggleWide()}
                            title={widePane ? t('revertPane') : t('expandPane')}
                            aria-label={widePane ? t('revertPane') : t('expandPane')}
                          >
                            <ChevronIcon />
                          </button>
                        </IonCol>
                        <IonCol size="auto">
                          <IonButton
                            fill="clear"
                            className="closeButton"
                            routerLink="/"
                            data-testid={fairwayId ? '' : 'backToHome'}
                            title={t('closePane')}
                            aria-label={t('closePane')}
                          >
                            <IonIcon className="otherIconLarge" src="/assets/icon/close_black_24dp.svg" />
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                    <img className="logo printable" src={vayla_logo} alt="Väylävirasto" />

                    {fairwayId && <FairwayCard widePane={widePane} id={fairwayId} />}
                    {!fairwayId && <FairwayCards widePane={widePane} />}
                  </IonContent>
                </IonCol>
                <IonCol size="auto">
                  <IonButton
                    fill="clear"
                    className={'togglePane' + (showPane ? ' flip' : '')}
                    data-testid={fairwayId ? '' : 'togglePane'}
                    onClick={() => togglePane()}
                    title={showPane ? t('hidePane') : t('showPane')}
                    aria-label={showPane ? t('hidePane') : t('showPane')}
                  >
                    <ChevronIcon />
                  </IonButton>
                </IonCol>
              </>
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

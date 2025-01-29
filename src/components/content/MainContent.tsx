import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonRow, useIonViewWillEnter } from '@ionic/react';
import ChevronIcon from '../../theme/img/chevron.svg?react';
import MenuIcon from '../../theme/img/menu.svg?react';
import { menuController } from '@ionic/core/components';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import FairwayCards from './FairwayCards';
import FairwayCard from './fairwayCard/FairwayCard';
import dvkMap from '../DvkMap';
import SearchbarDropdown from '../mapOverlays/SearchbarDropdown';
import { Lang, MINIMUM_QUERYLENGTH } from '../../utils/constants';
import { filterFairways } from '../../utils/common';
import vayla_logo from '../../theme/img/vayla_logo.png';
import vayla_logo_en from '../../theme/img/vayla_logo_en.png';
import { useFairwayCardListData } from '../../utils/dataLoader';
import SafetyEquipmentFaults from './SafetyEquipmentFaults';
import MarineWarnings from './MarineWarnings';
import './Content.css';
import { useDocumentTitle } from '../../hooks/dvkDocumentTitle';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { useDvkContext } from '../../hooks/dvkContext';
import HarborPreview from './HarborPreview';
import SquatCalculator from './SquatCalculator';
import PilotRoutes from './PilotRoutes';

interface MainContentProps {
  fairwayCardId?: string;
  splitPane?: boolean;
  target?: 'routes' | 'faults' | 'warnings' | 'squat' | 'harborPreview';
}

const MainContent: React.FC<MainContentProps> = ({ fairwayCardId, splitPane, target }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();
  const { data } = useFairwayCardListData();

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const [widePane, setWidePane] = useState(false);
  const [showPane, setShowPane] = useState(true);

  const mapElement = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const history = useHistory();

  const curPath = history.location.pathname;

  const filteredFairways = filterFairways(data?.fairwayCards, lang, searchQuery);
  const title = t('documentTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);
  const mainPageContentRef = useRef<HTMLIonButtonElement>(null);
  const grid = useRef<HTMLIonGridElement>(null);
  const pointerEventCache: PointerEvent[] = useMemo(() => [], []);

  const removeEvent = useCallback(
    (e: PointerEvent) => {
      const index = pointerEventCache.findIndex((cachedEvent) => cachedEvent.pointerId === e.pointerId);
      pointerEventCache.splice(index, 1);
    },
    [pointerEventCache]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      // If two pointers are down, stop (pinch) gestures
      if (pointerEventCache.length >= 2) {
        e.preventDefault();
      }

      removeEvent(e);
    },
    [pointerEventCache.length, removeEvent]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      pointerEventCache.push(e);
    },
    [pointerEventCache]
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // If two or more touch points are down, stop (pinch) gestures
    if (e.targetTouches.length > 1 || e.touches.length > 1) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    setDocumentTitle(title);
    const curr = grid.current;
    curr?.addEventListener('pointerup', handlePointerUp);
    curr?.addEventListener('pointercancel', handlePointerUp);
    curr?.addEventListener('pointerout', handlePointerUp);
    curr?.addEventListener('pointerleave', handlePointerUp);

    curr?.addEventListener('pointerdown', handlePointerDown);

    curr?.addEventListener('touchmove', handleTouchMove);
    return () => {
      curr?.removeEventListener('pointerup', handlePointerUp);
      curr?.removeEventListener('pointercancel', handlePointerUp);
      curr?.removeEventListener('pointerout', handlePointerUp);
      curr?.removeEventListener('pointerleave', handlePointerUp);

      curr?.removeEventListener('pointerdown', handlePointerDown);

      curr?.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handlePointerDown, handlePointerUp, handleTouchMove, setDocumentTitle, title]);

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
    if (event.key === 'Enter' && isSearchbarOpen) {
      event.preventDefault();
      closeDropdown();
      let targetPath = undefined;
      if (activeSelection) {
        targetPath = '/kortit/' + filteredFairways[activeSelection - 1].id;
      } else if (filteredFairways.length === 1) {
        targetPath = '/kortit/' + filteredFairways[0].id;
      } else {
        const searchTerm = searchQuery.trim().toLowerCase();
        const card = filteredFairways.filter((fairway) => fairway.name[lang]?.toLowerCase() === searchTerm).pop();
        if (card) {
          targetPath = '/kortit/' + card.id;
        }
      }
      if (targetPath && curPath !== targetPath) history.push(targetPath);
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
    if (mapElement?.current) {
      dvkMap?.removeShowSidebarMenuControl();
      dvkMap?.removeSearchbarControl();
      dvkMap.addLayerPopupControl();
      dvkMap.addCenterToOwnLocationControl();
      dvkMap.addZoomControl();
      dvkMap.addRotationControl();
      dvkMap?.setTarget(mapElement.current);
    }
  });

  return (
    <IonGrid className="ion-no-padding" id="splitPane" ref={grid}>
      <IonRow>
        {splitPane && (
          <>
            <IonCol
              id="fairwayContent"
              className={(widePane ? 'wide' : '') + (showPane ? '' : ' hidden')}
              data-testid={!target && (fairwayCardId ? 'cardPane' : 'listPane')}
            >
              <IonContent id="fairwayCardsContainer">
                <a
                  href="#mainPageContent"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    document.getElementById('mainPageContent')?.setAttribute('tabIndex', '-1');
                    document.getElementById('mainPageContent')?.focus({ preventScroll: false });
                    e.preventDefault();
                  }}
                  className="skip-to-main-content-link"
                >
                  {t('skip-to-content')}
                </a>
                <IonGrid className="ion-no-padding no-print">
                  <IonRow className="ion-align-items-center">
                    <IonCol size="auto">
                      <button
                        className="icon"
                        data-testid={!fairwayCardId && !target ? 'menuController' : ''}
                        onClick={() => menuController.open()}
                        title={t('openMenu')}
                        aria-label={t('openMenu')}
                      >
                        <MenuIcon />
                      </button>
                    </IonCol>
                    <IonCol className="ion-margin-start ion-margin-end">
                      <div className={'dropdownWrapper' + (widePane ? '' : ' placeholderSmallerFont')}>
                        <IonInput
                          disabled={state.preview}
                          aria-disabled={state.preview}
                          className="searchBar"
                          placeholder={state.preview ? '' : t('search')}
                          title={t('searchTitle')}
                          value={searchQuery}
                          onIonFocus={openDropdown}
                          onIonChange={(e) => changeAction(e.detail.value)}
                          onIonInput={(e) => changeAction(e.detail.value)}
                          onIonBlur={blurAction}
                          onKeyDown={(e) => keyDownAction(e)}
                          ref={inputRef}
                          data-testid="searchInput"
                        />
                        <button
                          type="button"
                          className="input-clear-icon"
                          title={t('clearTitle')}
                          aria-label={t('clearTitle')}
                          onClick={clearInput}
                          data-testid={!fairwayCardId && !target ? 'clearInput' : ''}
                        />
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
                        data-testid={'toggleWide'}
                        onClick={() => toggleWide()}
                        title={widePane ? t('revertPane') : t('expandPane')}
                        aria-label={widePane ? t('revertPane') : t('expandPane')}
                      >
                        <ChevronIcon />
                      </button>
                    </IonCol>
                    <IonCol size="auto">
                      <IonButton
                        disabled={state.preview}
                        aria-disabled={state.preview}
                        ref={mainPageContentRef}
                        fill="clear"
                        className="closeButton"
                        routerLink="/"
                        data-testid={!fairwayCardId && !target ? 'backToHome' : ''}
                        title={t('closePane')}
                        aria-label={t('closePane')}
                      >
                        <IonIcon className="otherIconLarge" src={closeIcon} aria-hidden="true" />
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
                <img className="logo printable" src={i18n.language === 'en' ? vayla_logo_en : vayla_logo} alt={t('logo')} />
                {fairwayCardId && <FairwayCard widePane={widePane} id={fairwayCardId} />}
                {!fairwayCardId && !target && <FairwayCards widePane={widePane} />}
                {target && target === 'routes' && <PilotRoutes widePane={widePane} />}
                {target && target === 'faults' && <SafetyEquipmentFaults widePane={widePane} />}
                {target && target === 'warnings' && <MarineWarnings widePane={widePane} />}
                {target && target === 'squat' && <SquatCalculator widePane={widePane} />}
                {target && target === 'harborPreview' && <HarborPreview widePane={widePane} />}
              </IonContent>
            </IonCol>
            <IonCol size="auto">
              <IonButton
                fill="clear"
                className={'togglePane' + (showPane ? ' flip' : '')}
                data-testid={!fairwayCardId && !target ? 'togglePane' : ''}
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
  );
};

export default MainContent;

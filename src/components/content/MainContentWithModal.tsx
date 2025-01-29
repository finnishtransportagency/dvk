import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonModal, IonRow, useIonViewWillEnter } from '@ionic/react';
import ArrowBackIcon from '../../theme/img/arrow_back.svg?react';
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
import { useDvkContext } from '../../hooks/dvkContext';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import HarborPreview from './HarborPreview';
import SquatCalculator from './SquatCalculator';
import PilotRoutes from './PilotRoutes';

interface ModalContentProps {
  modal: React.RefObject<HTMLIonModalElement>;
  modalOpen: boolean;
  modalContent?: string;
}

const MainContentWithModal: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });

  const mapElement = useRef<HTMLDivElement>(null);

  const title = t('documentTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);
  const [contentHeight, setContentHeight] = useState(100);

  const { state } = useDvkContext();

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useEffect(() => {
    setContentHeight(state.modalBreakpoint ? Math.max(100 - state.modalBreakpoint * 100, 50) : 100);
  }, [state.modalBreakpoint]);

  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addShowSidebarMenuControl();
      dvkMap.addSearchbarControl();
      dvkMap.addLayerPopupControl();
      dvkMap.addCenterToOwnLocationControl();
      dvkMap.addRotationControl();
      dvkMap?.setTarget(mapElement.current);
    }
  });

  return (
    <div id="mapPane" style={{ height: contentHeight + 'vh' }}>
      <IonContent className="ion-no-padding">
        <div ref={mapElement}></div>
      </IonContent>
    </div>
  );
};

export const ContentModal: React.FC<ModalContentProps> = ({ modal, modalOpen, modalContent }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;
  const { data } = useFairwayCardListData();
  const { state, dispatch } = useDvkContext();

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const history = useHistory();

  const curPath = history.location.pathname;

  const filteredFairways = filterFairways(data?.fairwayCards, lang, searchQuery);
  const title = t('documentTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);
  const pointerEventCache: PointerEvent[] = useMemo(() => [], []);

  useEffect(() => {
    if (state.preview) {
      dvkMap.getSearchbarControl().disable();
      dvkMap.getSearchbarControl().setPlaceholder('');
    }
  }, [state.preview]);

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
    const curr = modal.current;
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
  }, [handlePointerDown, handlePointerUp, handleTouchMove, modal, setDocumentTitle, title]);

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
      const targetPath = '/kortit/' + filteredFairways[activeSelection - 1].id;
      if (curPath !== targetPath) history.push('/kortit/' + filteredFairways[activeSelection - 1].id);
    }
  };

  const clearInput = () => {
    setSearchQuery('');
    inputRef.current?.setFocus();
  };

  const contentRef = useRef<HTMLIonContentElement>(null);
  const backToHome = () => {
    modal.current?.dismiss();
    history.push('/');
  };

  const checkBreakpoint = () => {
    modal.current?.getCurrentBreakpoint().then((breakpoint) => {
      dispatch({
        type: 'setBreakpoint',
        payload: {
          value: breakpoint ?? 0,
        },
      });
      if (breakpoint !== 1) contentRef.current?.scrollToTop();
    });
  };
  const setDefaultBreakpoint = () => {
    modal.current?.setCurrentBreakpoint(0.5);
  };

  const [fairwayCardId, setFairwayCardId] = useState('');

  useEffect(() => {
    const card = data?.fairwayCards.find((c) => c.id === modalContent);
    if (card?.id) {
      setFairwayCardId(card.id);
    } else if (
      modalContent &&
      modalContent !== 'fairwayCardList' &&
      modalContent !== 'pilotRouteList' &&
      modalContent !== 'safetyEquipmentFaultList' &&
      modalContent !== 'marineWarningList' &&
      modalContent !== 'squatCalculator' &&
      modalContent !== 'harborPreview'
    ) {
      setFairwayCardId(modalContent);
    } else {
      setFairwayCardId('');
    }
  }, [modalContent, data]);

  return (
    <IonModal
      ref={modal}
      isOpen={modalOpen}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.25, 0.5, 1]}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      handleBehavior="cycle"
      className={'contentModal' + (state.modalBreakpoint === 1 ? ' full' : '')}
      onDidDismiss={() => backToHome()}
      onIonBreakpointDidChange={() => checkBreakpoint()}
      canDismiss={!state.preview}
    >
      <IonContent className="ion-padding" ref={contentRef}>
        <IonGrid className="searchBar ion-no-padding no-print">
          <IonRow className="ion-align-items-center">
            <IonCol size="auto">
              <button
                className="icon"
                data-testid="backToDefaultView"
                onClick={() => setDefaultBreakpoint()}
                title={t('back')}
                aria-label={t('back')}
              >
                <ArrowBackIcon />
              </button>
            </IonCol>
            <IonCol className="ion-margin-start ion-margin-end">
              <div className="dropdownWrapper">
                <IonInput
                  disabled={state.preview}
                  aria-disabled={state.preview}
                  className="searchBar"
                  placeholder={state.preview ? '' : t('search')}
                  title={t('searchTitle')}
                  value={searchQuery}
                  onIonFocus={openDropdown}
                  onIonChange={(e) => changeAction(e.detail.value)}
                  onIonBlur={blurAction}
                  onKeyDown={(e) => keyDownAction(e)}
                  ref={inputRef}
                  data-testid={modalContent === 'fairwayCardList' ? 'searchInput' : ''}
                />
                <button
                  disabled={state.preview}
                  aria-disabled={state.preview}
                  type="button"
                  className="input-clear-icon"
                  title={t('clearTitle')}
                  aria-label={t('clearTitle')}
                  onClick={clearInput}
                  data-testid={modalContent === 'fairwayCardList' ? 'clearInput' : ''}
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
              <IonButton
                disabled={state.preview}
                aria-disabled={state.preview}
                fill="clear"
                className="closeButton"
                title={t('closePane')}
                aria-label={t('closePane')}
                onClick={() => backToHome()}
              >
                <IonIcon className="otherIconLarge" src={closeIcon} aria-hidden="true" />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <img className="logo printable" src={i18n.language === 'en' ? vayla_logo_en : vayla_logo} alt={t('logo')} />

        {fairwayCardId && <FairwayCard id={fairwayCardId} />}
        {!fairwayCardId && modalContent === 'fairwayCardList' && <FairwayCards />}
        {modalContent === 'pilotRouteList' && <PilotRoutes />}
        {modalContent === 'safetyEquipmentFaultList' && <SafetyEquipmentFaults />}
        {modalContent === 'marineWarningList' && <MarineWarnings />}
        {modalContent === 'squatCalculator' && <SquatCalculator />}
        {modalContent === 'harborPreview' && <HarborPreview />}
      </IonContent>
    </IonModal>
  );
};

export default MainContentWithModal;

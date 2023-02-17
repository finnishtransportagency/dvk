import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonModal, IonRow, useIonViewWillEnter } from '@ionic/react';
import { ReactComponent as ArrowBackIcon } from '../../theme/img/arrow_back.svg';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import FairwayCards from './FairwayCards';
import FairwayCard from './FairwayCard';
import dvkMap from '../DvkMap';
import SearchbarDropdown from '../mapOverlays/SearchbarDropdown';
import { Lang, MINIMUM_QUERYLENGTH } from '../../utils/constants';
import { filterFairways } from '../../utils/common';
import vayla_logo from '../../theme/img/vayla_logo.png';
import { useFairwayCardListData } from '../../utils/dataLoader';
import SafetyEquipmentFaults from './SafetyEquipmentFaults';
import MarineWarnings from './MarineWarnings';
import './Content.css';
import { useDocumentTitle } from '../../hooks/dvkDocumentTitle';
import { useDvkContext } from '../../hooks/dvkContext';

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

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

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
          value: breakpoint || 0,
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
    setFairwayCardId((data?.fairwayCards.filter((card) => card.id === modalContent) || '').length > 0 ? modalContent || '' : '');
  }, [modalContent, data]);

  return (
    <IonModal
      ref={modal}
      trigger="open-modal"
      isOpen={modalOpen}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.25, 0.5, 1]}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      handleBehavior="cycle"
      className={'contentModal' + (state.modalBreakpoint === 1 ? ' full' : '')}
      onDidDismiss={() => backToHome()}
      onIonBreakpointDidChange={() => checkBreakpoint()}
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
                  className="searchBar"
                  placeholder={t('search')}
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
                  type="button"
                  className="input-clear-icon"
                  title={t('clearTitle')}
                  aria-label={t('clearTitle')}
                  onClick={clearInput}
                  data-testid={modalContent === 'fairwayCardList' ? 'clearInput' : ''}
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
              <IonButton fill="clear" className="closeButton" title={t('closePane')} aria-label={t('closePane')} onClick={() => backToHome()}>
                <IonIcon className="otherIconLarge" src="/assets/icon/close_black_24dp.svg" />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <img className="logo printable" src={vayla_logo} alt="Väylävirasto" />

        {fairwayCardId && <FairwayCard id={fairwayCardId} />}
        {!fairwayCardId && modalContent === 'fairwayCardList' && <FairwayCards />}
        {modalContent === 'safetyEquipmentFaultList' && <SafetyEquipmentFaults />}
        {modalContent === 'marineWarningList' && <MarineWarnings />}
      </IonContent>
    </IonModal>
  );
};

export default MainContentWithModal;

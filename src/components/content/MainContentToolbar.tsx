import React, { useRef, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonInput, IonRow } from '@ionic/react';
import MenuIcon from '../../theme/img/menu.svg?react';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import SearchbarDropdown from '../mapOverlays/SearchbarDropdown';
import { menuController } from '@ionic/core/components';
import { useDvkContext } from '../../hooks/dvkContext';
import { useHistory } from 'react-router-dom';
import { Lang, MINIMUM_QUERYLENGTH } from '../../utils/constants';
import { filterFairways } from '../../utils/common';
import { useFairwayCardListData } from '../../utils/dataLoader';
import { useTranslation } from 'react-i18next';
import ChevronIcon from '../../theme/img/chevron.svg?react';

interface MainContentToolbarProps {
  fairwayCardId?: string;
  target?: 'routes' | 'faults' | 'warnings' | 'squat' | 'harborPreview';
  widePane: boolean;
  setWidePane: (v: boolean) => void;
}

export const MainContentToolbar: React.FC<MainContentToolbarProps> = ({ fairwayCardId, target, widePane, setWidePane }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const { state } = useDvkContext();
  const mainPageContentRef = useRef<HTMLIonButtonElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const history = useHistory();
  const curPath = history.location.pathname;
  const lang = i18n.resolvedLanguage as Lang;
  const { data } = useFairwayCardListData();

  const filteredFairways = filterFairways(data?.fairwayCards, lang, searchQuery);

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
  const clearInput = () => {
    setSearchQuery('');
    inputRef.current?.setFocus();
  };

  const toggleWide = () => {
    setWidePane(!widePane);
  };

  const keyDownAction = (event: React.KeyboardEvent<HTMLIonInputElement>) => {
    switch (event.key) {
      case 'Escape':
        closeDropdown();
        break;
      case 'Tab':
        if (isSearchbarOpen && searchQuery.trim().length >= MINIMUM_QUERYLENGTH) {
          event.preventDefault();
          setIsSearchbarOpen(false);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        handleArrowDownKeyDown((event.target as HTMLInputElement).type);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveSelection(activeSelection < 2 ? filteredFairways.length : activeSelection - 1);
        break;
      case 'Enter':
        if (isSearchbarOpen) {
          event.preventDefault();
          handleEnterKeyDown();
        }
        break;
      default:
    }
  };

  const handleArrowDownKeyDown = (eventTargetType: string) => {
    if (!isSearchbarOpen && eventTargetType !== 'button') {
      setIsSearchbarOpen(true);
    } else if (isSearchbarOpen && filteredFairways.length > 0) {
      setActiveSelection(activeSelection >= filteredFairways.length ? 1 : activeSelection + 1);
    }
  };

  const handleEnterKeyDown = () => {
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
  };

  return (
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
            <SearchbarDropdown isOpen={isSearchbarOpen} searchQuery={searchQuery.trim()} fairwayCards={filteredFairways} selected={activeSelection} />
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
  );
};

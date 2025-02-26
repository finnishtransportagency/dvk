import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonRow, useIonViewWillEnter } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import FairwayCards from './FairwayCards';
import FairwayCard from './fairwayCard/FairwayCard';
import dvkMap from '../DvkMap';
import vayla_logo from '../../theme/img/vayla_logo.png';
import vayla_logo_en from '../../theme/img/vayla_logo_en.png';
import SafetyEquipmentFaults from './SafetyEquipmentFaults';
import MarineWarnings from './MarineWarnings';
import './Content.css';
import { useDocumentTitle } from '../../hooks/dvkDocumentTitle';
import HarborPreview from './HarborPreview';
import SquatCalculator from './SquatCalculator';
import PilotRoutes from './PilotRoutes';
import { MainContentToolbar } from './MainContentToolbar';
import ChevronIcon from '../../theme/img/chevron.svg?react';

interface MainContentProps {
  fairwayCardId?: string;
  splitPane?: boolean;
  target?: 'routes' | 'faults' | 'warnings' | 'squat' | 'harborPreview';
}

const MainContent: React.FC<MainContentProps> = ({ fairwayCardId, splitPane, target }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const [showPane, setShowPane] = useState(true);
  const mapElement = useRef<HTMLDivElement>(null);
  const title = t('documentTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);
  const grid = useRef<HTMLIonGridElement>(null);
  const pointerEventCache: PointerEvent[] = useMemo(() => [], []);
  const [widePane, setWidePane] = useState(false);

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
                <MainContentToolbar fairwayCardId={fairwayCardId} target={target} widePane={widePane} setWidePane={setWidePane} />
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

import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { SwiperContainer } from 'swiper/element';
import { SwiperOptions } from 'swiper/types';
import './TabSwiper.css';
import { IonButton, IonLabel } from '@ionic/react';
import { getTabLabel } from '../../../utils/fairwayCardUtils';
import { useTranslation } from 'react-i18next';
import { FairwayCardTab } from './FairwayCardContent';

interface TabSwiperProps {
  tab: number;
  setTab: Dispatch<SetStateAction<number>>;
  widePane?: boolean;
  disabled?: boolean;
}

export const TabSwiper: React.FC<TabSwiperProps> = ({ tab, setTab, widePane, disabled }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const swiperRef = useRef<SwiperContainer>(null);
  useEffect(() => {
    const params: SwiperOptions = {
      grid: {
        fill: widePane ? 'row' : undefined,
        rows: widePane ? 1 : 2,
      },
      slidesPerView: widePane ? 6 : 3,
      keyboard: {
        enabled: true,
      },
    };
    if (swiperRef.current) {
      Object.assign(swiperRef.current, params);
      swiperRef.current.initialize();
    }
  }, [widePane]);

  const tabsClass = 'tabs' + (widePane ? ' wide' : '');
  const tabsIndicatorClass = 'tab-indicator' + (widePane ? ' wide' : '');

  return (
    <div className={tabsClass}>
      <swiper-container ref={swiperRef} init={false} className={widePane ? 'wide' : ''}>
        {[
          FairwayCardTab.Information,
          FairwayCardTab.Harbours,
          FairwayCardTab.CommonInformation,
          FairwayCardTab.PilotRoutes,
          FairwayCardTab.SquatCalculation,
          FairwayCardTab.WeatherForecasts,
        ].map((tabId) => {
          const selected = tabId === tab;
          // WatchSlidesProgress not working properly with React, so can't use 'slide-fully-visible' class, must apply own css class
          const cssClass = `${selected ? 'selected' : ''}`;
          return (
            <swiper-slide key={tabId}>
              <IonButton
                className={`ion-text-nowrap ${cssClass}`}
                expand="full"
                fill="clear"
                onClick={() => setTab(tabId)}
                data-testid={`tabButton-${tabId}`}
                disabled={disabled && !selected}
              >
                <div>
                  <IonLabel>{getTabLabel(t, tabId)}</IonLabel>
                  <div className={tabsIndicatorClass} />
                </div>
              </IonButton>
            </swiper-slide>
          );
        })}
      </swiper-container>
    </div>
  );
};

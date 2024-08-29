import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { SwiperContainer } from 'swiper/element';
import { SwiperOptions } from 'swiper/types';
import './TabSwiper.css';
import { IonButton, IonLabel } from '@ionic/react';
import { getTabLabel } from '../../../utils/fairwayCardUtils';
import { useTranslation } from 'react-i18next';

interface TabSwiperProps {
  tab: number;
  setTab: Dispatch<SetStateAction<number>>;
  widePane?: boolean;
  disabled?: boolean;
}

export const TabSwiper: React.FC<TabSwiperProps> = ({ tab, setTab, widePane, disabled }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const swiperRef = useRef<SwiperContainer>(null);
  const [activeSlide, setActiveSlide] = useState<number | undefined>(0);

  useEffect(() => {
    const params: SwiperOptions = {
      slidesPerView: 'auto',
      keyboard: {
        enabled: true,
      },
    };

    if (swiperRef.current) {
      Object.assign(swiperRef.current, params);
      swiperRef.current.initialize();
    }

    swiperRef.current?.addEventListener('swiperslidechange', () => {
      setActiveSlide(swiperRef.current?.swiper.activeIndex);
    });
  }, []);

  useEffect(() => {
    swiperRef.current?.swiper.slideTo(tab - 1);
  }, [tab]);

  return (
    <div className="tabs">
      <swiper-container ref={swiperRef} init={false} className={widePane ? 'wide' : ''}>
        {[1, 2, 3, 4].map((tabId) => {
          const selected = tabId === tab;
          // WatchSlidesProgress not working properly with React, so can't use 'slide-fully-visible' class, must apply own css class
          const slideNotVisible = activeSlide === 0 ? tabId === 4 : tabId === 1;
          const cssClass = `${selected ? 'selected' : ''} ${slideNotVisible && !widePane ? 'not-fully-visible' : ''}`;
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
                  <div className="tab-indicator" />
                </div>
              </IonButton>
            </swiper-slide>
          );
        })}
      </swiper-container>
    </div>
  );
};

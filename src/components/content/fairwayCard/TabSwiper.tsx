import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
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
}

export const TabSwiper: React.FC<TabSwiperProps> = ({ tab, setTab, widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const swiperRef = useRef<SwiperContainer>(null);

  useEffect(() => {
    const params: SwiperOptions = {
      slidesPerView: 'auto',
    };

    if (swiperRef.current) {
      Object.assign(swiperRef.current, params);
      swiperRef.current.initialize();
    }
  }, []);

  useEffect(() => {
    swiperRef.current?.swiper.slideTo(tab - 1);
  }, [tab]);

  return (
    <div className="tabs">
      <swiper-container ref={swiperRef} init={false} className={widePane ? 'wide' : ''}>
        {[1, 2, 3, 4].map((tabId) => (
          <swiper-slide key={tabId}>
            <IonButton className={tabId === tab ? 'selected' : ''} expand="full" fill="clear" onClick={() => setTab(tabId)}>
              <div>
                <IonLabel>{getTabLabel(t, tabId)}</IonLabel>
                <div className="tab-indicator" />
              </div>
            </IonButton>
          </swiper-slide>
        ))}
      </swiper-container>
    </div>
  );
};

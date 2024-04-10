import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { SwiperContainer } from 'swiper/element';
import { SwiperOptions } from 'swiper/types';
import './TabSwiper.css';
import { IonButton, IonLabel } from '@ionic/react';
import { getTabLabel } from '../../../utils/fairwayCardUtils';
import { useTranslation } from 'react-i18next';

interface TabSwiperProps {
  tab?: number;
  setTab: Dispatch<SetStateAction<number>>;
}

export const TabSwiper: React.FC<TabSwiperProps> = ({ setTab }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const swiperRef = useRef<SwiperContainer>(null);

  useEffect(() => {
    // listen for Swiper events using addEventListener
    /* swiperElRef.current.addEventListener('swiperprogress', (e) => {
      const [swiper, progress] = e.detail;
      console.log(progress);
    }); */

    /* swiperElRef.current.addEventListener('swiperslidechange', (e) => {
      console.log('slide changed');
    }); */
    const params: SwiperOptions = {
      slidesPerView: 'auto',
    };

    if (swiperRef.current) {
      Object.assign(swiperRef.current, params);
      swiperRef.current.initialize();
    }
  }, []);

  return (
    <div className="tabs">
      <swiper-container ref={swiperRef} init={false}>
        {[1, 2, 3, 4].map((tabId) => (
          <swiper-slide key={tabId}>
            <IonButton expand="full" fill="clear" onClick={() => setTab(tabId)}>
              <IonLabel>{getTabLabel(t, tabId)}</IonLabel>
            </IonButton>
          </swiper-slide>
        ))}
      </swiper-container>
    </div>
  );
};

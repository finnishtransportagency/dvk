import React, { useState } from 'react';
import { IonRow, IonCol, IonIcon, IonButton, IonGrid } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import './CustomPopup.css';
import { debounce } from 'lodash';
import dvkMap from '../DvkMap';
import { ObjectEvent } from 'ol/Object';
import { getMapCanvasWidth, isMobile } from '../../utils/common';

interface CustomPopupProps {
  isOpen: boolean;
  closePopup: () => void;
  icon: string;
  children: React.ReactNode;
}

interface CustomPopupContainerProps {
  children: React.ReactNode;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ isOpen, closePopup, icon, children }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: isOpen ? 'block' : 'none' }} className="custom-popup">
      <IonGrid className="ion-no-margin ion-no-padding">
        <IonRow>
          <IonCol size="auto" className="ion-align-self-center">
            <IonIcon className="infoIcon" icon={icon} aria-hidden="true" />
          </IonCol>
          {children}
          <IonCol size="auto">
            <IonButton
              onClick={() => closePopup()}
              fill="clear"
              className="closeButton ion-no-padding"
              title={t('common.close-dialog')}
              aria-label={t('common.close-dialog')}
            >
              <IonIcon className="otherIconLarge" src={closeIcon} aria-hidden="true" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export const CustomPopupContainer: React.FC<CustomPopupContainerProps> = ({ children }) => {
  const [backgroundWidth, setBackgroundWidth] = useState<number>(0);

  /* Use debounce to reduce events triggered by map size change */
  const debouncedBackgroundWidthRefresh = React.useRef(
    debounce(() => {
      setBackgroundWidth(getMapCanvasWidth());
    }, 20)
  ).current;

  /* Use map canvas size as reference for container width to position container relative to side modal */
  dvkMap.olMap?.on('change:size', (event: ObjectEvent) => {
    const { target, key, oldValue } = event;
    const newValue = target.get(key);
    // Opening side modal triggers map size changes that have undefined or zero values before calculating final size
    // Ignore changes in height
    if (newValue?.[0] && (!oldValue || oldValue[0] !== newValue[0])) {
      debouncedBackgroundWidthRefresh();
    }
  });

  return (
    <div
      className="custom-popup-container"
      style={!isMobile() ? { width: backgroundWidth + 'px', left: 'calc(100% - ' + backgroundWidth + 'px)' } : undefined}
    >
      {children}
    </div>
  );
};

export default CustomPopup;

import { IonButton, IonCol, IonGrid, IonIcon, IonModal, IonRow } from '@ionic/react';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isMobile } from '../../utils/common';
import dvkMap from '../DvkMap';
import './MarineWarningModal.css';
import closeIcon from '../../theme/img/close_black_24dp.svg';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className: string;
  children: React.ReactNode;
}

export const MarineWarningModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, className, children }) => {
  const { t } = useTranslation();
  const [size, setSize] = useState(dvkMap.olMap?.getSize() || [0, 0]);

  const debouncedModalPositionRefresh = React.useRef(
    debounce(() => {
      setSize(dvkMap.olMap?.getSize() || [0, 0]);
    }, 50)
  ).current;

  dvkMap.olMap?.on('moveend', () => {
    debouncedModalPositionRefresh();
  });
  dvkMap.olMap?.on('loadend', () => {
    debouncedModalPositionRefresh();
  });
  dvkMap.olMap?.once('rendercomplete', () => {
    debouncedModalPositionRefresh();
  });

  return (
    <IonModal
      isOpen={isOpen}
      className={'marinewarning ' + className + (isMobile() ? ' small' : '')}
      showBackdrop={isMobile()}
      onDidDismiss={() => setIsOpen(false)}
      backdropBreakpoint={isMobile() ? undefined : 1}
      initialBreakpoint={isMobile() ? undefined : 1}
      breakpoints={[0, 1]}
      style={!isMobile() ? { left: 'calc(100% - ' + size[0] + 'px)' } : undefined}
      tabIndex={isMobile() ? -1 : undefined}
    >
      <IonGrid className="ion-no-padding">
        <IonRow>
          {children}
          <IonCol size="auto">
            <IonButton
              onClick={() => setIsOpen(false)}
              fill="clear"
              className="closeButton"
              title={t('common.close-dialog')}
              aria-label={t('common.close-dialog')}
            >
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonModal>
  );
};

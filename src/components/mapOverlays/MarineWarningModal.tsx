import { IonButton, IonCol, IonGrid, IonIcon, IonModal, IonRow } from '@ionic/react';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isMobile } from '../../utils/common';
import dvkMap from '../DvkMap';
import infoIcon from '../../theme/img/info.svg';
import './MarineWarningModal.css';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MarineWarningModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const [size, setSize] = useState(dvkMap.olMap?.getSize() || [0, 0]);

  const debouncedPrintImageRefresh = React.useRef(
    debounce(() => {
      setSize(dvkMap.olMap?.getSize() || [0, 0]);
    }, 50)
  ).current;

  dvkMap.olMap?.on('moveend', () => {
    debouncedPrintImageRefresh();
  });
  dvkMap.olMap?.on('loadend', () => {
    debouncedPrintImageRefresh();
  });

  dvkMap.olMap?.once('rendercomplete', () => {
    debouncedPrintImageRefresh();
  });

  return (
    <IonModal
      isOpen={isOpen}
      className={'marinewarning' + (isMobile() ? ' small' : '')}
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
          <IonCol size="auto" className="ion-align-self-center">
            <IonIcon className="infoIcon" icon={infoIcon} />
          </IonCol>
          <IonCol>
            <strong>{t('warnings.note')}</strong> {t('warnings.notification')}
          </IonCol>
          <IonCol size="auto">
            <IonButton
              onClick={() => setIsOpen(false)}
              fill="clear"
              className="closeButton"
              title={t('common.close-dialog')}
              aria-label={t('common.close-dialog')}
            >
              <IonIcon className="otherIconLarge" src="assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonModal>
  );
};

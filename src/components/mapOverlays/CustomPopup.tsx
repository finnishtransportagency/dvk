import React from 'react';
import { IonRow, IonCol, IonIcon, IonButton, IonGrid } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import './CustomPopup.css';

interface CustomPopupProps {
  isOpen: boolean;
  closePopup: () => void;
  icon: string;
  children: React.ReactNode;
}

export const CustomPopup: React.FC<CustomPopupProps> = ({ isOpen, closePopup, icon, children }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: isOpen ? 'block' : 'none' }} className="custom-popup">
      <IonGrid className="ion-no-margin ion-no-padding">
        <IonRow>
          <IonCol size="auto" className="ion-align-self-center">
            <IonIcon className="infoIcon" icon={icon} />
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
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

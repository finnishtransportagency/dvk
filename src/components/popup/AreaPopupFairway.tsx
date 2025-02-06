import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Lang } from '../../utils/constants';
import { AreaFairway } from '../features';
import CloseButton from './CloseButton';

type AreaPopupFairwayProps = {
  fairway: AreaFairway;
  closePopup: () => void;
  index: number;
};

const AreaPopupFairway: React.FC<AreaPopupFairwayProps> = ({ fairway, closePopup, index }) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <IonRow key={fairway.fairwayId} className="ion-justify-content-between">
      <IonCol size="auto" className="header">
        {fairway.name[lang] ?? fairway.name.fi} {fairway.fairwayId}
      </IonCol>
      {index === 0 && (
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      )}
    </IonRow>
  );
};

export default AreaPopupFairway;

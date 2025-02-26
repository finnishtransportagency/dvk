import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Lang } from '../../utils/constants';
import { AreaFairway } from '../features';
import CloseButton from './CloseButton';

type AreaPopupFairwaysProps = {
  fairways: AreaFairway[];
  closePopup: () => void;
};

const AreaPopupFairways: React.FC<AreaPopupFairwaysProps> = ({ fairways, closePopup }) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <IonRow className="ion-justify-content-between">
      <IonCol size="auto" className="header">
        {fairways.map((fairway) => {
          return (
            <>
              {fairway.name[lang] ?? fairway.name.fi} {fairway.fairwayId}
              <br />
            </>
          );
        })}
      </IonCol>
      <IonCol size="auto">
        <CloseButton close={closePopup} />
      </IonCol>
    </IonRow>
  );
};

export default AreaPopupFairways;

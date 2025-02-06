import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { AreaFairway, AreaFeatureProperties, isShowN2000HeightSystem } from '../features';
import InfoIcon from '../../theme/img/info.svg?react';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useDvkContext } from '../../hooks/dvkContext';
import { getFairwayListFairwayCards } from '../../utils/fairwayCardUtils';
import { useFairwayCardListData } from '../../utils/dataLoader';
import { TFunction } from 'i18next';

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

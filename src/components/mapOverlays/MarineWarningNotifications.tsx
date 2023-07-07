import React, { useEffect, useState } from 'react';
import { FeatureLike } from 'ol/Feature';
import { isCoastalWarning } from '../../utils/common';
import { IonBackdrop, IonGrid } from '@ionic/react';
import { CoastalWarningItem } from './CoastalWarningItem';
import './MarineWarningNotifications.css';

interface MarineWarningNotificationsProps {
  showMarineWarnings: boolean;
  features: FeatureLike[];
}

interface MarineWarningNotificationProps {
  showMarineWarnings: boolean;
  featurePopup: CoastalWarningPopupProps;
  featurePopups: CoastalWarningPopupProps[];
  setFeaturePopups: (popups: CoastalWarningPopupProps[]) => void;
}

interface CoastalWarningPopupProps {
  feature: FeatureLike;
  visible: boolean;
}

const MarineWarningNotification: React.FC<MarineWarningNotificationProps> = ({ featurePopup, featurePopups, setFeaturePopups }) => {
  const { feature, visible } = featurePopup;

  const handlePopupClose = () => {
    const updatedFeaturePopups = featurePopups.map((popup) => {
      if (popup.feature.getId() === feature.getId()) {
        return { ...popup, visible: false };
      } else {
        return popup;
      }
    });
    setFeaturePopups(updatedFeaturePopups);
  };

  return (
    <div style={{ visibility: visible ? 'visible' : 'hidden', opacity: visible ? '1' : '0' }} className="marine-warning-overlay">
      <IonGrid className="ion-no-margin ion-no-padding">
        <CoastalWarningItem feature={feature} closePopup={handlePopupClose}></CoastalWarningItem>
      </IonGrid>
    </div>
  );
};

export const MarineWarningNotifications: React.FC<MarineWarningNotificationsProps> = ({ showMarineWarnings, features = [] }) => {
  const [featurePopups, setFeaturePopups] = useState<CoastalWarningPopupProps[]>([]);

  useEffect(() => {
    const coastalWarningFeatures = features.filter((feature) => isCoastalWarning(feature));
    const initialFeaturePopups = coastalWarningFeatures.map((feature) => ({ feature: feature, visible: true }));
    setFeaturePopups(initialFeaturePopups);
  }, [features]);

  return (
    <>
      {showMarineWarnings && featurePopups.some((popup) => popup.visible) && <IonBackdrop tappable={false} />}
      <div className="marine-warning-container">
        {showMarineWarnings &&
          featurePopups.map((featurePopup) => (
            <MarineWarningNotification
              key={'coastalWarning' + featurePopup.feature.getId()}
              showMarineWarnings={showMarineWarnings}
              featurePopup={featurePopup}
              featurePopups={featurePopups}
              setFeaturePopups={setFeaturePopups}
            />
          ))}
      </div>
    </>
  );
};

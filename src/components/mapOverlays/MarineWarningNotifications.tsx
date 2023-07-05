import React, { useEffect, useState } from 'react';
import { FeatureLike } from 'ol/Feature';
import { isCoastalWarning } from '../../utils/common';
import { IonGrid } from '@ionic/react';
import { CoastalWarningItem } from './CoastalWarningItem';
import './MarineWarningNotifications.css';

interface MarineWarningNotificationsProps {
  showMarineWarnings: boolean;
  features: FeatureLike[];
}

interface MarineWarningNotificationProps {
  showMarineWarnings: boolean;
  feature: FeatureLike;
}

const MarineWarningNotification: React.FC<MarineWarningNotificationProps> = ({ showMarineWarnings, feature }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setShowPopup(showMarineWarnings);
  }, [showMarineWarnings]);

  return (
    <div style={{ visibility: showPopup ? 'visible' : 'hidden', opacity: showPopup ? '1' : '0' }} className="marine-warning-overlay">
      <IonGrid className="ion-no-margin ion-no-padding">
        <CoastalWarningItem feature={feature} setShowPopup={setShowPopup}></CoastalWarningItem>
      </IonGrid>
    </div>
  );
};

export const MarineWarningNotifications: React.FC<MarineWarningNotificationsProps> = ({ showMarineWarnings, features = [] }) => {
  const coastalWarningFeatures = features.filter((feature) => isCoastalWarning(feature));

  return (
    <div className="marine-warning-container">
      {coastalWarningFeatures.map((feature) => (
        <MarineWarningNotification key={'coastalWarning' + feature.getId()} showMarineWarnings={showMarineWarnings} feature={feature} />
      ))}
    </div>
  );
};

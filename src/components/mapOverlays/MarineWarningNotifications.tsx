import React, { useEffect, useState } from 'react';
import { FeatureLike } from 'ol/Feature';
import { isCoastalWarning } from '../../utils/common';
import { IonBackdrop, IonCol } from '@ionic/react';
import { CustomPopup } from './CustomPopup';
import { CoastalWarningItem } from './CoastalWarningItem';
import { useTranslation } from 'react-i18next';
import marineWarningIcon from '../../theme/img/merivaroitus_ikoni_plain.svg';
import infoIcon from '../../theme/img/info.svg';
import './MarineWarningNotifications.css';

interface MarineWarningNotificationsProps {
  showMarineWarnings: boolean;
  features: FeatureLike[];
}

interface MarineWarningInfoProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

interface CoastalWarningNotificationProps {
  featureNotification: FeatureNotification;
  featureNotifications: FeatureNotification[];
  setFeatureNotifications: (notifications: FeatureNotification[]) => void;
}

interface FeatureNotification {
  feature: FeatureLike;
  visible: boolean;
}

const MarineWarningInfo: React.FC<MarineWarningInfoProps> = ({ visible, setVisible }) => {
  const { t } = useTranslation();
  const handlePopupClose = () => setVisible(false);

  return (
    <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={infoIcon}>
      <IonCol>
        <strong>{t('warnings.note')}</strong> {t('warnings.notification')}
      </IonCol>
    </CustomPopup>
  );
};

const CoastalWarningNotification: React.FC<CoastalWarningNotificationProps> = ({
  featureNotification,
  featureNotifications,
  setFeatureNotifications,
}) => {
  const { feature, visible } = featureNotification;

  const handlePopupClose = () => {
    const updatedFeaturePopups = featureNotifications.map((notification) => {
      if (notification.feature.getId() === feature.getId()) {
        return { ...notification, visible: false };
      } else {
        return notification;
      }
    });
    setFeatureNotifications(updatedFeaturePopups);
  };

  return (
    <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={marineWarningIcon}>
      <CoastalWarningItem feature={feature}></CoastalWarningItem>
    </CustomPopup>
  );
};

export const MarineWarningNotifications: React.FC<MarineWarningNotificationsProps> = ({ showMarineWarnings, features = [] }) => {
  const [featureNotifications, setFeatureNotifications] = useState<FeatureNotification[]>([]);
  const [infoVisible, setInfoVisible] = useState(false);

  useEffect(() => {
    const coastalWarningFeatures = features.filter((feature) => isCoastalWarning(feature));
    const initialFeatureNotifications = coastalWarningFeatures.map((feature) => ({ feature: feature, visible: true }));
    setFeatureNotifications(initialFeatureNotifications);
  }, [features]);

  useEffect(() => {
    setInfoVisible(showMarineWarnings);
  }, [showMarineWarnings]);

  return (
    <>
      {showMarineWarnings && (infoVisible || featureNotifications.some((notification) => notification.visible)) && <IonBackdrop tappable={false} />}
      <div className="marine-warning-container">
        {showMarineWarnings &&
          featureNotifications.map((notification) => (
            <CoastalWarningNotification
              key={'coastalWarning' + notification.feature.getId()}
              featureNotification={notification}
              featureNotifications={featureNotifications}
              setFeatureNotifications={setFeatureNotifications}
            />
          ))}
        {showMarineWarnings && <MarineWarningInfo visible={infoVisible} setVisible={setInfoVisible} />}
      </div>
    </>
  );
};

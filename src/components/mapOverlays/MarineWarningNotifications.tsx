import React, { useEffect, useState } from 'react';
import { isCoastalWarning, isMobile } from '../../utils/common';
import { IonBackdrop, IonCol } from '@ionic/react';
import { CustomPopup } from './CustomPopup';
import { CoastalWarningItem } from './CoastalWarningItem';
import { useTranslation } from 'react-i18next';
import { useMarineWarningsDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import { MarineWarning } from '../../graphql/generated';
import marineWarningIcon from '../../theme/img/merivaroitus_ikoni_plain.svg';
import infoIcon from '../../theme/img/info.svg';
import './MarineWarningNotifications.css';

interface MarineWarningNotificationsProps {
  showMarineWarnings: boolean;
}

interface MarineWarningInfoProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

interface CoastalWarningNotificationProps {
  warningNotification: MarineWarningNotification;
  warningNotifications: MarineWarningNotification[];
  setWarningNotifications: (notifications: MarineWarningNotification[]) => void;
}

interface MarineWarningNotification {
  marineWarning: MarineWarning;
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
  warningNotification,
  warningNotifications,
  setWarningNotifications,
}) => {
  const { marineWarning, visible } = warningNotification;

  const handlePopupClose = () => {
    const updatedWarningNotifications = warningNotifications.map((notification) => {
      if (notification.marineWarning.id === marineWarning.id) {
        return { ...notification, visible: false };
      } else {
        return notification;
      }
    });
    setWarningNotifications(updatedWarningNotifications);
  };

  return (
    <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={marineWarningIcon}>
      <CoastalWarningItem marineWarning={marineWarning}></CoastalWarningItem>
    </CustomPopup>
  );
};

export const MarineWarningNotifications: React.FC<MarineWarningNotificationsProps> = ({ showMarineWarnings }) => {
  const [warningNotifications, setWarningNotifications] = useState<MarineWarningNotification[]>([]);
  const [infoVisible, setInfoVisible] = useState(false);

  const { data, isLoading, isFetching } = useMarineWarningsDataWithRelatedDataInvalidation();

  useEffect(() => {
    if (showMarineWarnings) {
      setInfoVisible(showMarineWarnings);

      if (!isFetching && !isLoading && data) {
        const { marineWarnings } = data;
        const coastalWarnings = marineWarnings.filter((warning) => isCoastalWarning(warning.type));
        const initialWarnings = coastalWarnings.map((warning) => ({ marineWarning: warning, visible: true }));

        setWarningNotifications(initialWarnings);
      }
    }
  }, [data, isLoading, isFetching, showMarineWarnings]);

  return (
    <>
      {isMobile() && showMarineWarnings && (infoVisible || warningNotifications.some((notification) => notification.visible)) && (
        <IonBackdrop tappable={false} />
      )}
      <div className="marine-warning-container">
        {showMarineWarnings &&
          warningNotifications.map((notification) => (
            <CoastalWarningNotification
              key={'coastalWarning' + notification.marineWarning.id}
              warningNotification={notification}
              warningNotifications={warningNotifications}
              setWarningNotifications={setWarningNotifications}
            />
          ))}
        {showMarineWarnings && <MarineWarningInfo visible={infoVisible} setVisible={setInfoVisible} />}
      </div>
    </>
  );
};

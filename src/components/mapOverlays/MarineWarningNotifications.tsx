import React, { useEffect, useState } from 'react';
import { isGeneralMarineWarning, isMobile } from '../../utils/common';
import { IonBackdrop, IonCol } from '@ionic/react';
import CustomPopup, { CustomPopupContainer } from './CustomPopup';
import { GeneralMarineWarningItem } from './GeneralMarineWarningItem';
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

interface GeneralMarineWarningNotificationProps {
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

const GeneralMarineWarningNotification: React.FC<GeneralMarineWarningNotificationProps> = ({
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
      <GeneralMarineWarningItem marineWarning={marineWarning}></GeneralMarineWarningItem>
    </CustomPopup>
  );
};

export const MarineWarningNotifications: React.FC<MarineWarningNotificationsProps> = ({ showMarineWarnings }) => {
  const [warningNotifications, setWarningNotifications] = useState<MarineWarningNotification[]>([]);
  const [infoVisible, setInfoVisible] = useState(false);

  const { data, isPending, isFetching } = useMarineWarningsDataWithRelatedDataInvalidation();

  useEffect(() => {
    if (showMarineWarnings) {
      setInfoVisible(showMarineWarnings);

      if (!isFetching && !isPending && data) {
        const { marineWarnings } = data;
        const generalWarnings = marineWarnings.filter((warning) => isGeneralMarineWarning(warning.area));
        const initialWarnings = generalWarnings.map((warning) => ({ marineWarning: warning, visible: true }));

        setWarningNotifications(initialWarnings);
      }
    }
  }, [data, isPending, isFetching, showMarineWarnings]);

  return (
    <>
      {isMobile() && showMarineWarnings && (infoVisible || warningNotifications.some((notification) => notification.visible)) && (
        <IonBackdrop tappable={false} />
      )}
      <CustomPopupContainer>
        {showMarineWarnings &&
          warningNotifications.map((notification) => (
            <GeneralMarineWarningNotification
              key={'generalMarineWarning' + notification.marineWarning.id}
              warningNotification={notification}
              warningNotifications={warningNotifications}
              setWarningNotifications={setWarningNotifications}
            />
          ))}
        {showMarineWarnings && <MarineWarningInfo visible={infoVisible} setVisible={setInfoVisible} />}
      </CustomPopupContainer>
    </>
  );
};

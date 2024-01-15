import React, { useEffect, useState } from 'react';
import { useDvkContext } from '../../hooks/dvkContext';
import errorIcon from '../../theme/img/safetyequipment/error_icon.svg';
import { IonCol } from '@ionic/react';
import CustomPopup, { CustomPopupContainer } from './CustomPopup';

export const LoadErrorNotifications: React.FC = () => {
  const { state } = useDvkContext();
  const [visible, setVisible] = useState(false);

  const handlePopupClose = () => setVisible(false);

  useEffect(() => {
    if (Number(state.response[0]) !== 200 && state.response.length !== 0) {
      setVisible(true);
    }
  }, [state.response]);

  return (
    <CustomPopupContainer>
      <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={errorIcon}>
        <IonCol>
          <p>
            <strong>
              Error: {state.response[0]} {state.response[1]}.&nbsp;
            </strong>
            {state.response[2]}
          </p>
        </IonCol>
      </CustomPopup>
    </CustomPopupContainer>
  );
};

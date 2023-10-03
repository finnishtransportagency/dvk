import React, { useEffect, useState } from 'react';
import { useDvkContext } from '../../hooks/dvkContext';
import { CustomPopup } from './CustomPopup';
import errorIcon from '../../theme/img/safetyequipment/error_icon.svg';

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
    <div className="loader-error-container">
      <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={errorIcon}>
        <p>TESTI</p>
      </CustomPopup>
    </div>
  );
};

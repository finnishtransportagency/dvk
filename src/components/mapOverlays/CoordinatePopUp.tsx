import React, { useEffect, useState } from 'react';
import { useDvkContext } from '../../hooks/dvkContext';
import infoIcon from '../../theme/img/info.svg';
import { IonCol } from '@ionic/react';
import CustomPopup, { CustomPopupContainer } from './CustomPopup';
import { useTranslation } from 'react-i18next';

const CoordinatePopUp: React.FC = () => {
  const { t } = useTranslation();
  const { dispatch, state } = useDvkContext();
  const [visible, setVisible] = useState(false);

  const handlePopupClose = () => setVisible(false);

  useEffect(() => {
    if (state.coordinates) {
      setVisible(true);
    }
  }, [state.coordinates]);

  useEffect(() => {
    if (!visible) {
      dispatch({
        type: 'setCoordinates',
        payload: {
          value: '',
        },
      });
    }
  }, [dispatch, visible]);

  return (
    <CustomPopupContainer>
      <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={infoIcon}>
        <IonCol>
          <p>
            <strong>{t('popup.common.locationCoordinates')}:&nbsp;</strong>
            {state.coordinates}
          </p>
        </IonCol>
      </CustomPopup>
    </CustomPopupContainer>
  );
};

export default CoordinatePopUp;

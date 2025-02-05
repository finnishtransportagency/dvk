import React, { useEffect, useState } from 'react';
import { useDvkContext } from '../../hooks/dvkContext';
import infoIcon from '../../theme/img/info.svg';
import { IonCol } from '@ionic/react';
import CustomPopup, { CustomPopupContainer } from './CustomPopup';
import { useTranslation } from 'react-i18next';
import dvkMap from '../DvkMap';

const CoordinatePopUp: React.FC = () => {
  const { t } = useTranslation();
  const { dispatch, state } = useDvkContext();
  const [visible, setVisible] = useState(false);

  const handlePopupClose = () => setVisible(false);

  const coordinatesSource = dvkMap.getVectorSource('coordinateslocation');

  useEffect(() => {
    setVisible(!!state.coordinates);
  }, [state.coordinates]);

  useEffect(() => {
    if (!visible) {
      dispatch({
        type: 'setCoordinates',
        payload: {
          value: '',
        },
      });
      coordinatesSource.clear();
    }
  }, [dispatch, visible, coordinatesSource]);

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

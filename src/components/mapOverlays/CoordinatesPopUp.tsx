import React, { useEffect, useState } from 'react';
import { useDvkContext } from '../../hooks/dvkContext';
import infoIcon from '../../theme/img/info.svg';
import { IonButton, IonCol, IonIcon, IonRow, IonToast } from '@ionic/react';
import CustomPopup, { CustomPopupContainer } from './CustomPopup';
import { useTranslation } from 'react-i18next';
import copyIcon from '../../theme/img/copy_to_clipboard.svg';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { clearCoordinatesLayerAndPopUp } from '../../utils/common';

const CoordinatesPopUp: React.FC = () => {
  const { t } = useTranslation();
  const { dispatch, state } = useDvkContext();
  const [visible, setVisible] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);

  const handlePopupClose = () => setVisible(false);

  const handleCopyclick = () => {
    navigator.clipboard.writeText(state.coordinates);
    setShowCopyToast(true);
  };

  useEffect(() => {
    setVisible(!!state.coordinates);
  }, [state.coordinates]);

  useEffect(() => {
    if (!visible) {
      clearCoordinatesLayerAndPopUp(dispatch);
    }
  }, [dispatch, visible]);

  return (
    <CustomPopupContainer>
      <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={infoIcon}>
        <IonCol>
          <IonRow>
            <p id="textContent">
              <strong>{t('popup.common.locationCoordinates')}:&nbsp;</strong>
              {state.coordinates}
            </p>
            <IonButton fill="clear" className="ion-no-margin" title={t('popup.common.copyToClipboard')} onClick={() => handleCopyclick()}>
              <IonIcon slot="icon-only" src={copyIcon} />
              <IonToast
                isOpen={showCopyToast}
                onDidDismiss={() => setShowCopyToast(false)}
                message={t('popup.common.copiedToClipboard')}
                duration={2000}
                icon={checkmarkCircleOutline}
                positionAnchor="textContent"
                position="bottom"
              />
            </IonButton>
          </IonRow>
        </IonCol>
      </CustomPopup>
    </CustomPopupContainer>
  );
};

export default CoordinatesPopUp;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { IonButton, IonIcon } from '@ionic/react';
import closeIcon from '../../theme/img/close_black_24dp.svg';

type CloseButtonProps = {
  close: () => void;
};

const CloseButton: React.FC<CloseButtonProps> = ({ close }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });

  return (
    <IonButton fill="clear" className="closeButton" onClick={() => close()} title={t('close')} aria-label={t('close')} size="small">
      <IonIcon className="otherIconLarge" src={closeIcon} />
    </IonButton>
  );
};

export default CloseButton;

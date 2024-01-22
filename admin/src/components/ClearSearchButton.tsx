import { IonButton, IonIcon } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import searchIcon from '../theme/img/search.svg';
import closeIcon from '../theme/img/close_primary.svg';

interface ClearSearchButtonProps {
  clearInput: () => void;
  disabled: boolean;
}

const ClearSearchButton: React.FC<ClearSearchButtonProps> = ({ clearInput, disabled }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });

  return (
    <IonButton
      aria-label={t('search-clear-title') ?? ''}
      className="clearSearch"
      disabled={disabled}
      fill="clear"
      onClick={clearInput}
      size="small"
      slot="end"
    >
      <IonIcon icon={disabled ? searchIcon : closeIcon} slot="icon-only" className={disabled ? '' : 'closeIcon'} />
    </IonButton>
  );
};

export default ClearSearchButton;

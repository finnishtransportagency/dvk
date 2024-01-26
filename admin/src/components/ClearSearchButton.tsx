import { IonButton } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_primary.svg?react';
import SearchIcon from '../theme/img/search.svg?react';

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
      {disabled ? <SearchIcon /> : <CloseIcon width="18px" height="18px" />}
    </IonButton>
  );
};

export default ClearSearchButton;

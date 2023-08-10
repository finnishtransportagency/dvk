import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClearButtonProps {
  clearInput: () => void;
}

const ClearButton: React.FC<ClearButtonProps> = ({ clearInput }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });

  return (
    <button
      type="button"
      className="input-clear-icon"
      title={t('search-clear-title') ?? ''}
      aria-label={t('search-clear-title') ?? ''}
      onClick={clearInput}
    />
  );
};

export default ClearButton;

import React from 'react';
import './Map.css';
import { useTranslation } from 'react-i18next';

const Map: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t('homePage.map.content')}</p>
    </div>
  );
};

export default Map;

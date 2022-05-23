import './Map.css';
import { useTranslation } from 'react-i18next';

interface ContainerProps { }

const Map: React.FC<ContainerProps> = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t('homePage.map.content')}</p>
    </div>
  );
};

export default Map;

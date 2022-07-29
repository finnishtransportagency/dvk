import React from 'react';
import './Map.css';
import { useTranslation } from 'react-i18next';
import { FindAllFairwaysQuery, useFindAllFairwaysQuery } from '../graphql/generated';

interface FairwaysProps {
  data?: FindAllFairwaysQuery;
}

const Fairways: React.FC<FairwaysProps> = (props) => {
  return (
    <ul>
      {props.data?.fairways.map((fairway, idx) => {
        return <li key={idx}>{fairway.name.fi}</li>;
      })}
    </ul>
  );
};

const Map: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFindAllFairwaysQuery();
  return (
    <div>
      <p>{t('homePage.map.content')}</p>
      <Fairways data={data} />
    </div>
  );
};

export default Map;

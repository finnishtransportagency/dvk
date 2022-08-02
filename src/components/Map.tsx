import React, { useEffect, useState } from 'react';
import './Map.css';
import { useTranslation } from 'react-i18next';
import { FindAllFairwaysQuery, useFindAllFairwaysQuery } from '../graphql/generated';

interface FairwaysProps {
  data?: FindAllFairwaysQuery;
}

const Fairways: React.FC<FairwaysProps> = (props) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <ul>
      {props.data?.fairways.map((fairway, idx) => {
        return <li key={idx}>{fairway.name[lang]}</li>;
      })}
    </ul>
  );
};

type Hello = {
  hello: string;
};

async function fetchData(): Promise<Hello> {
  return (await fetch(process.env.REACT_APP_REST_API_URL ? process.env.REACT_APP_REST_API_URL + '/csv' : '/api/csv')).json();
}

const Csv: React.FC = () => {
  const [csvString, setCsvString] = useState<string>('');
  useEffect(() => {
    fetchData().then((response) => setCsvString(response.hello));
  }, [csvString]);
  return <p>{csvString}</p>;
};

const Map: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFindAllFairwaysQuery();
  return (
    <div>
      <p>{t('homePage.map.content')}</p>
      <Fairways data={data} />
      <Csv />
    </div>
  );
};

export default Map;

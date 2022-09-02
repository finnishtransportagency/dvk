import React, { useEffect, useState } from 'react';
import './Map.css';
import { useTranslation } from 'react-i18next';
import { FindAllFairwayCardsQuery, useFindAllFairwayCardsQuery } from '../graphql/generated';

interface FairwayCardsProps {
  data?: FindAllFairwayCardsQuery;
}

const FairwayCards: React.FC<FairwayCardsProps> = (props) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <ul>
      {props.data?.fairwayCards.map((fairwayCard, idx) => {
        return <li key={idx}>{fairwayCard.name[lang]}</li>;
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

function fetchGeoTIFF(): Promise<Response> {
  return fetch(
    process.env.REACT_APP_FRONTEND_DOMAIN_NAME
      ? 'https://' + process.env.REACT_APP_FRONTEND_DOMAIN_NAME + '/geotiff/6375/Saimaa_5_5m_ruutu.tif'
      : '/geotiff/6375/Saimaa_5_5m_ruutu.tif'
  );
}

const Csv: React.FC = () => {
  const [csvString, setCsvString] = useState<string>('');
  useEffect(() => {
    fetchData().then((response) => setCsvString(response.hello));
    fetchGeoTIFF().then((response) => console.log('GeoTIFF HTTP status: ' + response.status));
  }, []);
  return <p>{csvString}</p>;
};

const Map: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFindAllFairwayCardsQuery();
  return (
    <div>
      <p>{t('homePage.map.content')}</p>
      <FairwayCards data={data} />
      <Csv />
    </div>
  );
};

export default Map;

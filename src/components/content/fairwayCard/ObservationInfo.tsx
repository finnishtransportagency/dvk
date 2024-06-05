import React from 'react';
import { useTranslation } from 'react-i18next';
import { Geometry } from 'ol/geom';
import { Feature } from 'ol';
import { ObservationFeatureProperties } from '../../features';

interface ObservationInfoProps {
  observations: Feature<Geometry>[];
}

function getObservationList(observations: Feature<Geometry>[]) {
  const names = observations.map((o: Feature<Geometry>) => {
    const properties = o.getProperties() as ObservationFeatureProperties;
    return properties.name;
  });
  return names;
}

export const ObservationInfo: React.FC<ObservationInfoProps> = ({ observations }) => {
  const { t } = useTranslation();

  const observationList = getObservationList(observations);
  const observationText = observationList.length > 0 ? observationList.join(', ') : t('common.noDataSet');

  return (
    <p>
      <strong>{t('fairwayCards.windGauge')}:</strong> {observationText}
    </p>
  );
};

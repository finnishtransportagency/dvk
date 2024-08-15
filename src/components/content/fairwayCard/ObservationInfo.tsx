import React from 'react';
import { useTranslation } from 'react-i18next';
import { Geometry } from 'ol/geom';
import { Feature } from 'ol';
import { setSelectedObservation } from '../../layers';
import { ObservationFeatureProperties } from '../../features';
import { IonLabel, IonText } from '@ionic/react';

interface ObservationInfoProps {
  observations: Feature<Geometry>[];
}

type ObservationInfo = {
  id: string | number | undefined;
  name: string;
};

function getObservationInfos(observations: Feature<Geometry>[]): Array<ObservationInfo> {
  const observationInfos = observations.map((o: Feature<Geometry>) => {
    const properties = o.getProperties() as ObservationFeatureProperties;
    return { id: o.getId(), name: properties.name };
  });
  return observationInfos;
}

export const ObservationInfo: React.FC<ObservationInfoProps> = ({ observations }) => {
  const { t } = useTranslation();

  const highlightObservation = (id: string | number) => {
    setSelectedObservation(id);
  };

  const observationInfos = getObservationInfos(observations);

  function getObservationElements(observationInfos: ObservationInfo[]) {
    return (
      <>
        {observationInfos?.map((o, idx) => {
          return (
            <IonText key={o.id}>
              <IonLabel
                className="inlineHoverText"
                onMouseEnter={() => highlightObservation(o.id ?? 0)}
                onFocus={() => highlightObservation(o.id ?? 0)}
                onMouseLeave={() => highlightObservation(0)}
                onBlur={() => highlightObservation(0)}
                tabIndex={0}
                data-testid={idx < 1 ? 'observationHover' : ''}
              >
                {o.name}
              </IonLabel>
              {idx < observationInfos.length - 1 && <>,&nbsp;</>}
            </IonText>
          );
        })}
      </>
    );
  }

  return (
    <p>
      <strong>{t('fairwayCards.windGauge')}:</strong>&nbsp;
      {observationInfos.length > 0 ? getObservationElements(observationInfos) : t('common.noDataSet')}
    </p>
  );
};

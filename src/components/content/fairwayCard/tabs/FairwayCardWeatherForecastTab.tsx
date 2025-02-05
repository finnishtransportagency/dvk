import React, { useEffect, useState } from 'react';
import { FairwayCardPartsFragment } from '../../../../graphql/generated';
import { useWeatherLimits } from '../../../../utils/dataLoader';
import { useForecastFeatures } from '../../../ForecastLoader';
import { getFairwayCardForecasts } from '../../../../utils/fairwayCardUtils';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import ForecastContainer from '../../ForecastContainer';
import { asWeatherLimits, findWeatherLimitById } from '../../../../utils/weatherUtils';
import { Alert } from '../Alert';
import { useTranslation } from 'react-i18next';

interface FairwayCardWeatherForecastTabProps {
  fairwayCard: FairwayCardPartsFragment;
}
export const FairwayCardWeatherForecastTab: React.FC<FairwayCardWeatherForecastTabProps> = ({ fairwayCard }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const [forecasts, setForecasts] = useState<Feature<Geometry>[]>([]);
  const { data: weatherLimits } = useWeatherLimits();
  const { forecastFeatures, ready: forecastsReady } = useForecastFeatures();
  useEffect(() => {
    if (fairwayCard && forecastsReady) {
      setForecasts(getFairwayCardForecasts(fairwayCard, forecastFeatures));
    }
  }, [forecastsReady, forecastFeatures, fairwayCard]);

  return (
    <>
      {forecastsReady && forecasts ? (
        forecasts.map((f) => {
          return (
            <ForecastContainer
              forecast={f}
              key={f.getId()}
              multicontainer={forecasts.length > 1}
              weatherLimits={findWeatherLimitById(asWeatherLimits(weatherLimits?.weatherLimits ?? []), f.getId() ? String(f.getId()) : undefined)}
            />
          );
        })
      ) : (
        <Alert errorText={t('forecastNotFound')}></Alert>
      )}
    </>
  );
};

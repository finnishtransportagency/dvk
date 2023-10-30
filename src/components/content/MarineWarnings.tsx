import { IonText, IonSkeletonText } from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../utils/constants';
import { useMarineWarningsDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import dvkMap from '../DvkMap';
import { MarineWarningFeatureProperties } from '../features';
import Breadcrumb from './Breadcrumb';
import infoIcon from '../../theme/img/info.svg';
import alertIcon from '../../theme/img/alert_icon.svg';
import Alert from '../Alert';
import { getAlertProperties, getMarineWarningDataLayerId } from '../../utils/common';
import './MarineWarnings.css';
import { useDvkContext } from '../../hooks/dvkContext';
import WarningsFilter from './WarningsFilter';
import { WarningList } from './WarningList';

type MarineWarningsProps = {
  widePane?: boolean;
};

const MarineWarnings: React.FC<MarineWarningsProps> = ({ widePane }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'warnings' });
  const lang = i18n.resolvedLanguage as Lang;
  const { data, isLoading, dataUpdatedAt, isFetching } = useMarineWarningsDataWithRelatedDataInvalidation();
  const { state } = useDvkContext();
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortNewFirst, setSortNewFirst] = useState<boolean>(true);

  const path = [{ title: t('title') }];
  // Use any of the marine warning layers as they have the same data source
  const alertProps = getAlertProperties(dataUpdatedAt, 'coastalwarning');

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps?.duration) return t('viewLastUpdatedUnknown');
    return t('lastUpdatedAt', { val: alertProps.duration });
  }, [alertProps, t]);

  useEffect(() => {
    return () => {
      // Cleanup: remove feature(s) from temporary layer
      dvkMap.getVectorSource('selectedfairwaycard').clear();
    };
  }, []);

  const filterDataByAreaAndType = useCallback(() => {
    const filteredData = data?.marineWarnings.filter((w) => {
      let foundInArea = true;
      let foundInType = true;

      if (areaFilter.length > 0) {
        foundInArea = areaFilter.some((a) => w.area[lang]?.includes(a.toUpperCase()));
      }
      if (typeFilter.length > 0) {
        foundInType = typeFilter.some((type) => w.type[lang]?.includes(type.toUpperCase()));
      }
      return foundInArea && foundInType;
    });

    return filteredData;
  }, [areaFilter, typeFilter, data?.marineWarnings, lang]);

  useEffect(() => {
    const source = dvkMap.getVectorSource('selectedfairwaycard');
    const features = source.getFeatures();
    // Check if corresponding layer is now visible and remove feature(s) from temp layer
    if (features.length > 0) {
      features.forEach((f) => {
        const featureProperties = f.getProperties() as MarineWarningFeatureProperties;
        const layerDataId = getMarineWarningDataLayerId(featureProperties.type);
        if (state.layers.includes(layerDataId)) {
          source.removeFeature(f);
        }
      });
    }
  }, [state.layers]);

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{t('title')}</strong>
        </h2>
        <em>
          {t('modified')} {!isLoading && !isFetching && <>{t('datetimeFormat', { val: dataUpdatedAt })}</>}
          {(isLoading || isFetching) && (
            <IonSkeletonText
              animated={true}
              style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
            />
          )}
        </em>
      </IonText>

      <Alert
        icon={infoIcon}
        className="top-margin info"
        title={
          <>
            <strong>{t('note')}</strong> {t('notification')}
          </>
        }
      />

      {alertProps && !isLoading && !isFetching && (
        <Alert icon={alertIcon} color={alertProps.color} className={'top-margin ' + alertProps.color} title={getLayerItemAlertText()} />
      )}
      <WarningsFilter setAreaFilter={setAreaFilter} setTypeFilter={setTypeFilter} setSortNewFirst={setSortNewFirst} sortNewFirst={sortNewFirst} />
      <div id="marineWarningList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="marineWarningList">
        <WarningList loading={isLoading} data={filterDataByAreaAndType() ?? []} sortNewFirst={sortNewFirst} />
      </div>
    </>
  );
};

export default MarineWarnings;

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../utils/constants';
import { useMarineWarningsDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import dvkMap from '../DvkMap';
import { MarineWarningFeatureProperties } from '../features';
import Breadcrumb from './Breadcrumb';
import infoIcon from '../../theme/img/info.svg';
import Alert from '../Alert';
import { getMarineWarningDataLayerId } from '../../utils/common';
import './MarineWarnings.css';
import { useDvkContext } from '../../hooks/dvkContext';
import WarningsFilter from './WarningsFilter';
import { WarningList } from './WarningList';
import PageHeader from './PageHeader';
import VectorSource from 'ol/source/Vector';

type MarineWarningsProps = {
  widePane?: boolean;
};

const MarineWarnings: React.FC<MarineWarningsProps> = ({ widePane }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { data, isPending, dataUpdatedAt, isFetching } = useMarineWarningsDataWithRelatedDataInvalidation();
  const { state } = useDvkContext();
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortNewFirst, setSortNewFirst] = useState<boolean>(true);

  const path = [{ title: t('warnings.title') }];

  const filterDataByAreaAndType = useCallback(() => {
    const filteredData = data?.marineWarnings.filter((w) => {
      let foundInArea = true;
      let foundInType = true;

      if (areaFilter.length > 0) {
        foundInArea = areaFilter.some((a) => {
          // exception for all sea areas when lang is fi
          if (a === 'seaAreas' && lang === 'fi') {
            return w.area[lang]?.includes('merialueet'.toUpperCase());
          }
          return w.area[lang]?.includes(t(`areas.${a}`).toUpperCase());
        });
      }
      if (typeFilter.length > 0) {
        foundInType = typeFilter.some((type) => w.type[lang]?.includes(t(`homePage.map.controls.layer.${type}`).toUpperCase()));
      }
      return foundInArea && foundInType;
    });

    return filteredData;
  }, [areaFilter, typeFilter, data?.marineWarnings, lang, t]);

  useEffect(() => {
    return () => {
      // Cleanup: remove feature(s) from temporary layer
      const fairwayCardLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
      (fairwayCardLayer.getSource() as VectorSource).clear();
      fairwayCardLayer.setVisible(false);
    };
  }, []);

  useEffect(() => {
    const fairwayCardLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
    const fairwayCardSource = fairwayCardLayer?.getSource() as VectorSource;
    const features = fairwayCardSource?.getFeatures();

    if (['coastalwarning', 'localwarning', 'boaterwarning'].every((l) => state.layers.includes(l))) {
      fairwayCardLayer?.setVisible(false);
    } else {
      fairwayCardLayer?.setVisible(true);
    }

    if (features && features.length > 0) {
      // Check if corresponding layer is now visible and remove feature(s) from temp layer
      features.forEach((f) => {
        const featureProperties = f.getProperties() as MarineWarningFeatureProperties;
        const layerDataId = getMarineWarningDataLayerId(featureProperties.type);
        if (state.layers.includes(layerDataId)) {
          fairwayCardSource.removeFeature(f);
        }
      });
    }
  }, [state.layers]);

  return (
    <>
      <Breadcrumb path={path} />
      <PageHeader title={t('warnings.title')} layerId="coastalwarning" isPending={isPending} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt}>
        <Alert
          icon={infoIcon}
          className="top-margin info"
          title={
            <>
              <strong>{t('warnings.note')}</strong> {t('warnings.notification')}
            </>
          }
        />
      </PageHeader>

      <WarningsFilter
        areaFilter={areaFilter}
        typeFilter={typeFilter}
        setAreaFilter={setAreaFilter}
        setTypeFilter={setTypeFilter}
        setSortNewFirst={setSortNewFirst}
        sortNewFirst={sortNewFirst}
      />
      <div id="marineWarningList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="marineWarningList">
        <WarningList loading={isPending} data={filterDataByAreaAndType() ?? []} sortNewFirst={sortNewFirst} />
      </div>
    </>
  );
};

export default MarineWarnings;

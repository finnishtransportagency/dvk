import React, { useEffect, useState } from 'react';
import { IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { useFeatureData } from '../../utils/dataLoader';
import { FeatureDataLayerId, OFFLINE_STORAGE } from '../../utils/constants';
import PageHeader from './PageHeader';
import { PilotRouteFeatureProperties } from '../features';
import { Feature, Geometry } from 'geojson';
import dvkMap from '../DvkMap';
import { useDvkContext } from '../../hooks/dvkContext';
import VectorSource from 'ol/source/Vector';
import PilotRouteList from './PilotRouteList';

interface PilotRoutesProps {
  widePane?: boolean;
}

const layerId: FeatureDataLayerId = 'pilotroute';

const PilotRoutes: React.FC<PilotRoutesProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const { state } = useDvkContext();
  const { data, dataUpdatedAt, isPending, isFetching, isSuccess } = useFeatureData(
    layerId,
    true,
    60 * 60 * 1000,
    true,
    OFFLINE_STORAGE.staleTime,
    OFFLINE_STORAGE.cacheTime
  );
  const [pilotRoutes, setPilotRoutes] = useState<Feature<Geometry>[]>([]);
  const path = [{ title: t('routes.title') }];

  useEffect(() => {
    if (isSuccess && data?.features && data?.features.length > 0) {
      const features = (data.features as Feature<Geometry>[]).toSorted((a, b) => {
        const aProps = a.properties as PilotRouteFeatureProperties;
        const bProps = b.properties as PilotRouteFeatureProperties;
        return aProps.name.localeCompare(bProps.name, 'fi', { ignorePunctuation: true });
      });
      setPilotRoutes(features);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    return () => {
      // Cleanup: remove feature(s) from fairway card layer
      const fairwayCardLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
      (fairwayCardLayer.getSource() as VectorSource).clear();
      fairwayCardLayer.setVisible(false);
    };
  }, []);

  useEffect(() => {
    // If pilot route layer is not visible, show selected pilot route on fairway card layer
    const fairwayCardLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
    // Layer might not be ready on initial render, but we don't mind that since it's clear and hidden as it should be
    if (fairwayCardLayer) {
      (fairwayCardLayer.getSource() as VectorSource).clear();
      fairwayCardLayer.setVisible(!state.layers.includes(layerId));
    }
  }, [state.layers]);

  return (
    <>
      <Breadcrumb path={path} />
      <PageHeader title={t('routes.title')} layerId={layerId} isPending={isPending} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt} />

      <div id="pilotRouteList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="pilotRouteList">
        {isPending ? (
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>
        ) : (
          <PilotRouteList featureLink={'/luotsausreitit/'} pilotRoutes={pilotRoutes} layerId={layerId} layers={state.layers} />
        )}
      </div>
    </>
  );
};

export default PilotRoutes;

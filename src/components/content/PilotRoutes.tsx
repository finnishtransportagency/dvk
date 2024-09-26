import React, { useEffect, useState } from 'react';
import { IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { FeatureDataLayerId } from '../../utils/constants';
import PageHeader from './PageHeader';
import { PilotRouteFeatureProperties } from '../features';
import dvkMap from '../DvkMap';
import { useDvkContext } from '../../hooks/dvkContext';
import VectorSource from 'ol/source/Vector';
import Alert from '../Alert';
import infoIcon from '../../theme/img/info.svg';
import PilotRouteList from './PilotRouteList';
import { usePilotRouteFeatures } from '../PilotRouteFeatureLoader';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

interface PilotRoutesProps {
  widePane?: boolean;
}

const layerId: FeatureDataLayerId = 'pilotroute';

const PilotRoutes: React.FC<PilotRoutesProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const { state } = useDvkContext();
  const { pilotRouteFeatures, ready: pilotRoutesReady, dataUpdatedAt, isPending, isFetching } = usePilotRouteFeatures();

  const [pilotRoutes, setPilotRoutes] = useState<Feature<Geometry>[]>([]);
  const path = [{ title: t('routes.title') }];

  useEffect(() => {
    if (pilotRoutesReady && pilotRouteFeatures && pilotRouteFeatures.length > 0) {
      const features = pilotRouteFeatures.toSorted((a, b) => {
        const aProps = a.getProperties() as PilotRouteFeatureProperties;
        const bProps = b.getProperties() as PilotRouteFeatureProperties;
        return aProps.name.localeCompare(bProps.name, 'fi', { ignorePunctuation: true });
      });
      setPilotRoutes(features);
    }
  }, [pilotRouteFeatures, pilotRoutesReady]);

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
      {import.meta.env.VITE_APP_ENV !== 'prod' && <Alert title={t('routes.info')} icon={infoIcon} className="top-margin info" />}
      <div id="pilotRouteList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="pilotRouteList">
        {pilotRoutesReady ? (
          <PilotRouteList featureLink={'/luotsausreitit/'} pilotRoutes={pilotRoutes} layerId={layerId} layers={state.layers} />
        ) : (
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>
        )}
      </div>
    </>
  );
};

export default PilotRoutes;

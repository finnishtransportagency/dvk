import React, { useEffect, useState } from 'react';
import { IonCol, IonGrid, IonRow, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { useFeatureData } from '../../utils/dataLoader';
import { FeatureLayerId, OFFLINE_STORAGE } from '../../utils/constants';
import PageHeader from './PageHeader';
import { PilotRouteFeatureProperties } from '../features';
import { Feature, Geometry } from 'geojson';
import './PilotRoutes.css';

interface PilotRoutesProps {
  widePane?: boolean;
}

const layerId: FeatureLayerId = 'pilotroute';

const PilotRoutes: React.FC<PilotRoutesProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const { data, dataUpdatedAt, isPending, isFetching, isSuccess } = useFeatureData(
    layerId,
    true,
    60 * 60 * 1000,
    true,
    OFFLINE_STORAGE.staleTime,
    OFFLINE_STORAGE.staleTime
  );
  const [pilotRoutes, setPilotRoutes] = useState<Feature<Geometry>[]>([]);
  const path = [{ title: t('routes.title') }];

  useEffect(() => {
    if (isSuccess && data?.features?.length > 0) {
      const features = (data.features as Feature<Geometry>[]).toSorted((a, b) => {
        const aProps = a.properties as PilotRouteFeatureProperties;
        const bProps = b.properties as PilotRouteFeatureProperties;
        return aProps.name.localeCompare(bProps.name, 'fi', { ignorePunctuation: true });
      });
      setPilotRoutes(features);
    }
  }, [data, isSuccess]);

  return (
    <>
      <Breadcrumb path={path} />
      <PageHeader title={t('routes.title')} layerId={layerId} isPending={isPending} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt} />

      <div id="pilotRouteList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="pilotRouteList">
        {isPending ? (
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>
        ) : (
          <IonGrid className="route-table ion-no-padding">
            {pilotRoutes.map((pilotRoute) => {
              const properties = pilotRoute.properties as PilotRouteFeatureProperties;
              return (
                <IonGrid key={pilotRoute.id} className="group inlineHoverText ion-no-padding">
                  <IonRow className="header">
                    <IonCol>
                      {t('routes.route')} {properties.name}
                    </IonCol>
                  </IonRow>
                </IonGrid>
              );
            })}
          </IonGrid>
        )}
      </div>
    </>
  );
};

export default PilotRoutes;

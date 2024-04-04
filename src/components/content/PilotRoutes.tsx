import React, { useEffect, useState } from 'react';
import { IonCol, IonGrid, IonRow, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { useFeatureData } from '../../utils/dataLoader';
import { FeatureDataLayerId, OFFLINE_STORAGE } from '../../utils/constants';
import PageHeader from './PageHeader';
import { PilotRouteFeatureProperties } from '../features';
import { Feature, Geometry } from 'geojson';
import { Feature as olFeature } from 'ol';
import { Geometry as olGeometry } from 'ol/geom';
import './PilotRoutes.css';
import dvkMap from '../DvkMap';
import { zoomToFeatureCoordinates } from '../../utils/coordinateUtils';
import { useDvkContext } from '../../hooks/dvkContext';
import { Link } from 'react-router-dom';
import { setSelectedPilotRoute } from '../layers';
import VectorSource from 'ol/source/Vector';

interface PilotRoutesProps {
  widePane?: boolean;
}

const layerId: FeatureDataLayerId = 'pilotroute';

function goto(id: number, layers: string[]) {
  const feature = dvkMap.getVectorSource(layerId).getFeatureById(id) as olFeature<olGeometry>;
  if (feature) {
    zoomToFeatureCoordinates(feature, layers, layerId);
  }
}

const PilotRoutes: React.FC<PilotRoutesProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const { state } = useDvkContext();
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
    (fairwayCardLayer.getSource() as VectorSource).clear();
    fairwayCardLayer.setVisible(!state.layers.includes(layerId));
  }, [state.layers]);

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
                <IonGrid
                  key={properties.id}
                  className="group inlineHoverText ion-no-padding"
                  onMouseEnter={() => setSelectedPilotRoute(properties.id, true)}
                  onFocus={() => setSelectedPilotRoute(properties.id, true)}
                  onMouseLeave={() => setSelectedPilotRoute(properties.id, false)}
                  onBlur={() => setSelectedPilotRoute(properties.id, false)}
                >
                  <IonRow className="header">
                    <IonCol>
                      <Link
                        to="/luotsausreitit/"
                        onClick={(e) => {
                          e.preventDefault();
                          goto(properties.id, state.layers);
                        }}
                      >
                        {t('routes.route')} {properties.name}
                      </Link>
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

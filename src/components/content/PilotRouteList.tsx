import React from 'react';
import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FeatureLayerId } from '../../utils/constants';
import { PilotRouteFeatureProperties } from '../features';
import { Feature, Geometry } from 'geojson';
import { Link } from 'react-router-dom';
import { setSelectedPilotRoute } from '../layers';
import { goToFeature } from '../../utils/common';
import { RtzFileDownload } from '../RtzFileDownload';
import './PilotRoutesList.css';
import InfoIcon from '../../theme/img/info.svg?react';

interface PilotRouteListProps {
  pilotRoutes: Feature<Geometry>[];
  featureLink: string;
  layerId: FeatureLayerId;
  layers?: string[];
}

const PilotRouteList: React.FC<PilotRouteListProps> = ({ pilotRoutes, featureLink, layerId, layers }) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="route-table ion-no-padding">
      {pilotRoutes?.map((pilotRoute) => {
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
                  to={featureLink}
                  onClick={(e) => {
                    e.preventDefault();
                    goToFeature(properties.id, layerId, layers);
                  }}
                >
                  {t('routes.route')} {properties.name}
                </Link>
              </IonCol>
            </IonRow>
            {properties.rtz && (
              <IonRow>
                <IonCol>
                  <IonRow>
                    <IonText className="header">{`${t('routes.rtz')}:`}</IonText>&nbsp;
                    <RtzFileDownload name={properties.name} rtz={properties.rtz} />
                  </IonRow>
                </IonCol>
              </IonRow>
            )}
            <IonRow style={{ padding: '0px 0px 4px 0px' }}>
              <IonText className="header">{`${t('routes.linkedFairwayCards')}:`}</IonText>&nbsp;
              <div className="info">
                <InfoIcon />
                {t('common.noDataSet')}
              </div>
            </IonRow>
          </IonGrid>
        );
      })}
    </IonGrid>
  );
};

export default PilotRouteList;

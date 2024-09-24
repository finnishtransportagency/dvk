import React from 'react';
import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FeatureLayerId, Lang } from '../../utils/constants';
import { PilotRouteFeatureProperties } from '../features';
import { Link } from 'react-router-dom';
import { setSelectedPilotRoute } from '../layers';
import { goToFeature } from '../../utils/common';
import { RtzFileDownload } from '../RtzFileDownload';
import './PilotRoutesList.css';
import InfoIcon from '../../theme/img/info.svg?react';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

interface PilotRouteListProps {
  pilotRoutes: Feature<Geometry>[];
  featureLink: string;
  layerId: FeatureLayerId;
  layers?: string[];
}

const PilotRouteList: React.FC<PilotRouteListProps> = ({ pilotRoutes, featureLink, layerId, layers }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <IonGrid className="route-table ion-no-padding">
      {pilotRoutes?.map((pilotRoute) => {
        const properties = pilotRoute.getProperties() as PilotRouteFeatureProperties;
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
            {layerId !== 'selectedfairwaycard' && (
              <IonRow>
                <IonCol className="fairwayCardLink">
                  <IonText className="header">{`${t('routes.linkedFairwayCards')}:`}</IonText>&nbsp;
                  {properties.fairwayCards.length > 0 ? (
                    properties.fairwayCards.map((card, idx) => (
                      <div key={card.id}>
                        <Link to={`/kortit/${card.id}`}>{card.name[lang]}</Link>
                        {idx < properties.fairwayCards.length - 1 ? ', ' : ''}
                      </div>
                    ))
                  ) : (
                    <div className="info">
                      <InfoIcon />
                      {t('common.noDataSet')}
                    </div>
                  )}
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        );
      })}
    </IonGrid>
  );
};

export default PilotRouteList;

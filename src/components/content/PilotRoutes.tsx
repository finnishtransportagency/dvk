import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import './MarineWarnings.css';

type PilotRoutesProps = {
  widePane?: boolean;
};

const PilotRoutes: React.FC<PilotRoutesProps> = ({ widePane }) => {
  const { t } = useTranslation();

  const path = [{ title: t('routes.title') }];

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{t('routes.title')}</strong>
        </h2>
      </IonText>
      <div id="pilotRouteList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="pilotRouteList"></div>
    </>
  );
};

export default PilotRoutes;

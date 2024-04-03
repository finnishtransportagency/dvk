import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { useFeatureData } from '../../utils/dataLoader';
import { OFFLINE_STORAGE } from '../../utils/constants';
import PageHeader from './PageHeader';

type PilotRoutesProps = {
  widePane?: boolean;
};

const PilotRoutes: React.FC<PilotRoutesProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const { data, dataUpdatedAt, errorUpdatedAt, isPending, isFetching, isError } = useFeatureData(
    'pilotroute',
    true,
    60 * 60 * 1000,
    true,
    OFFLINE_STORAGE.staleTime,
    OFFLINE_STORAGE.staleTime
  );
  const path = [{ title: t('routes.title') }];

  console.log(data, dataUpdatedAt, errorUpdatedAt, isPending, isError);

  return (
    <>
      <Breadcrumb path={path} />
      <PageHeader title={t('routes.title')} layerId="pilotroute" isPending={isPending} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt} />

      <div id="pilotRouteList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="pilotRouteList">
        <IonGrid>
          <IonRow>
            <IonCol></IonCol>
          </IonRow>
        </IonGrid>
      </div>
    </>
  );
};

export default PilotRoutes;

import {
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonText,
  IonBreadcrumbs,
  IonBreadcrumb,
  IonSkeletonText,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
} from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { SafetyEquipmentFault } from '../graphql/generated';
import arrow_down from '../theme/img/arrow_down.svg';
import { Lang } from '../utils/constants';
import { useSafetyEquipmentFaultData } from '../utils/dataLoader';
import { coordinatesToStringHDM } from '../utils/CoordinateUtils';

type FaultGroupProps = {
  data: SafetyEquipmentFault[];
  title: string;
  loading?: boolean;
  first?: boolean;
};

const FaultGroup: React.FC<FaultGroupProps> = ({ data, title, loading, first }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'faults' });
  const lang = i18n.resolvedLanguage as Lang;

  // Sort faults by recordTime (desc)
  // and group faults by equipmentId
  const sortedFaults = [...data].sort((a, b) => {
    return a.recordTime > b.recordTime ? -1 : 1;
  });

  const groupedFaults: SafetyEquipmentFault[][] = [];
  sortedFaults.forEach((value) => {
    const isEquipmentUsed = groupedFaults.filter((item) => item.length > 0 && item[0].equipmentId === value.equipmentId).length !== 0;
    if (!isEquipmentUsed) groupedFaults.push(sortedFaults.filter((fault) => fault.equipmentId === value.equipmentId));
  });

  return (
    <div>
      <IonText className={first ? 'no-margin-top' : ''}>
        <h4>
          <strong>{title}</strong>
        </h4>
      </IonText>
      {loading && <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>}
      {groupedFaults.map((faultArray) => {
        return (
          <IonGrid className="table light group" key={faultArray[0].equipmentId}>
            <IonRow className="header">
              <IonCol>
                <IonLabel>
                  <strong>
                    {(faultArray[0].name && faultArray[0].name[lang]) || faultArray[0].name?.fi} - {faultArray[0].equipmentId}
                  </strong>
                </IonLabel>
              </IonCol>
              <IonCol className="ion-text-end">
                <IonLabel>
                  {faultArray[0].geometry?.coordinates && (
                    <>
                      {faultArray[0].geometry?.coordinates[0] &&
                        faultArray[0].geometry?.coordinates[1] &&
                        coordinatesToStringHDM([faultArray[0].geometry?.coordinates[0], faultArray[0].geometry.coordinates[1]])}
                      .
                    </>
                  )}
                </IonLabel>
              </IonCol>
            </IonRow>
            {faultArray.map((fault) => (
              <IonRow key={fault.id}>
                <IonCol>
                  <IonLabel>{(fault.type && fault.type[lang]) || fault.type?.fi}</IonLabel>
                </IonCol>
                <IonCol className="ion-text-end">
                  <IonLabel>
                    <em>{fault.recordTime && <>{t('recordTime', { val: fault.recordTime })}</>}</em>
                  </IonLabel>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        );
      })}
    </div>
  );
};

type FaultsProps = {
  widePane?: boolean;
};

const SafetyEquipmentFaults: React.FC<FaultsProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'faults' });
  const { data, isLoading } = useSafetyEquipmentFaultData();
  const [showDescription, setShowDescription] = useState();

  return (
    <>
      <IonBreadcrumbs>
        <IonBreadcrumb routerLink="/">
          {t('home')}
          <IonLabel slot="separator">&gt;</IonLabel>
        </IonBreadcrumb>
        <IonBreadcrumb>
          <strong>{t('title')}</strong>
        </IonBreadcrumb>
      </IonBreadcrumbs>

      <IonText>
        <h2>
          <strong>{t('title')}</strong>
        </h2>
      </IonText>
      <IonAccordionGroup onIonChange={(e) => setShowDescription(e.detail.value)}>
        <IonAccordion toggleIcon={arrow_down} color="lightest" value="1">
          <IonItem
            slot="header"
            color="lightest"
            className="accItem"
            title={showDescription ? t('closeDescription') : t('openDescription')}
            aria-label={showDescription ? t('closeDescription') : t('openDescription')}
          >
            <IonLabel>{t('general')}</IonLabel>
          </IonItem>
          <div className={'tabContent active show-print' + (widePane ? ' wide' : '')} slot="content">
            <IonText>
              <p>
                <strong>{t('description')}</strong>
              </p>
              <p>{t('additionalDescription')}</p>
              <p>
                <em>{t('notification')}</em>
              </p>
            </IonText>
          </div>
        </IonAccordion>
      </IonAccordionGroup>

      <div className={'tabContent active show-print' + (widePane ? ' wide' : '')}>
        <FaultGroup
          title={t('archipelagoSea') + ', ' + t('gulfOfFinland') + t('and') + t('gulfOfBothnia')}
          loading={isLoading}
          data={data?.safetyEquipmentFaults || []}
          first
        />
      </div>
    </>
  );
};

export default SafetyEquipmentFaults;

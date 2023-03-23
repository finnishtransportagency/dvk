import React from 'react';
import { IonGrid, IonRow, IonCol, IonLabel, IonText, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { SafetyEquipmentFault } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import { useSafetyEquipmentFaultDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import Breadcrumb from './Breadcrumb';
import { getMap } from '../DvkMap';
import { Card, EquipmentFeatureProperties } from '../features';
import { Link } from 'react-router-dom';
import Alert from '../Alert';
import { getAlertProperties } from '../../utils/common';
import { warningOutline } from 'ionicons/icons';

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
  const equipments = getMap().getVectorSource('safetyequipment');
  return (
    <div>
      <IonText className={first ? 'no-margin-top' : ''}>
        <h4>
          <strong>{title}</strong>
        </h4>
      </IonText>
      {loading && <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>}
      {groupedFaults.map((faultArray) => {
        const equipment = equipments.getFeatureById(faultArray[0].equipmentId)?.getProperties() as EquipmentFeatureProperties | undefined;
        const cardMap: Map<string, Card> = new Map();
        equipment?.fairways?.forEach((f) => {
          if (f.fairwayCards) {
            for (const card of f.fairwayCards) {
              cardMap.set(card.id, card);
            }
          }
        });
        const cards = Array.from(cardMap.values());
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
                    <em>{fault.recordTime > 0 && <>{t('datetimeFormat', { val: fault.recordTime })}</>}</em>
                  </IonLabel>
                </IonCol>
              </IonRow>
            ))}
            {cards.length > 0 && (
              <>
                <IonRow>
                  <IonCol>{t('fairways')}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    {cards.map((card, idx) => (
                      <span key={card.id}>
                        <Link to={`/kortit/${card.id}`}>{card.name[lang]}</Link>
                        {idx < cards.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </IonCol>
                </IonRow>
              </>
            )}
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
  const { t } = useTranslation();
  const { data, isLoading, dataUpdatedAt, isFetching } = useSafetyEquipmentFaultDataWithRelatedDataInvalidation();
  const path = [{ title: t('faults.title') }];
  const alertProps = getAlertProperties(dataUpdatedAt);
  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle">
        <h2 className="no-margin-bottom">
          <strong>{t('faults.title')}</strong>
        </h2>
        <em>
          {t('faults.modified')} {!isLoading && !isFetching && <>{t('faults.datetimeFormat', { val: dataUpdatedAt })}</>}
          {(isLoading || isFetching) && (
            <IonSkeletonText
              animated={true}
              style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
            />
          )}
        </em>
      </IonText>

      {alertProps && !isLoading && !isFetching && (
        <Alert
          icon={warningOutline}
          color={alertProps.color}
          className={'top-margin ' + alertProps.color}
          title={t('warnings.lastUpdatedAt', { val: alertProps.duration })}
        />
      )}

      <div className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="safetyEquipmentFaultList">
        <FaultGroup
          title={t('faults.archipelagoSea') + ', ' + t('faults.gulfOfFinland') + t('faults.and') + t('faults.gulfOfBothnia')}
          loading={isLoading}
          data={data?.safetyEquipmentFaults || []}
          first
        />
      </div>
    </>
  );
};

export default SafetyEquipmentFaults;

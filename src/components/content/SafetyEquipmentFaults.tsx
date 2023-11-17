import React, { useCallback, useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonLabel, IonText, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { SafetyEquipmentFault } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import { useSafetyEquipmentFaultDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import Breadcrumb from './Breadcrumb';
import { getMap } from '../DvkMap';
import { Card, EquipmentFeatureProperties } from '../features';
import { Link } from 'react-router-dom';
import Alert from '../Alert';
import { getAlertProperties } from '../../utils/common';
import alertIcon from '../../theme/img/alert_icon.svg';
import './SafetyEquipmentFaults.css';
import * as olExtent from 'ol/extent';
import { useDvkContext } from '../../hooks/dvkContext';
import { useSafetyEquipmentLayer } from '../FeatureLoader';
import { setSelectedSafetyEquipment } from '../layers';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

type FaultGroupProps = {
  data: SafetyEquipmentFault[];
  loading?: boolean;
};

function goto(id: number) {
  const dvkMap = getMap();
  const feature = dvkMap.getVectorSource('safetyequipment').getFeatureById(id) as Feature<Geometry>;
  if (feature) {
    setSelectedSafetyEquipment(id);
    const geometry = feature.getGeometry();
    if (geometry) {
      const extent = olExtent.createEmpty();
      olExtent.extend(extent, geometry.getExtent());
      dvkMap.olMap?.getView().fit(extent, { minResolution: 10, padding: [50, 50, 50, 50], duration: 1000 });
    }
  }
}

const FaultGroup: React.FC<FaultGroupProps> = ({ data, loading }) => {
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
  const equipmentSource = getMap().getVectorSource('safetyequipment');
  return (
    <>
      {loading && <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>}
      {groupedFaults.map((faultArray) => {
        const feature = equipmentSource.getFeatureById(faultArray[0].equipmentId) as Feature<Geometry>;
        const equipment = feature?.getProperties() as EquipmentFeatureProperties | undefined;
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
          <IonGrid className="table light group ion-no-padding" key={faultArray[0].equipmentId}>
            <IonRow className="header">
              <IonCol className="ion-no-padding">
                <IonLabel>
                  <strong>
                    {(faultArray[0].name && faultArray[0].name[lang]) || faultArray[0].name?.fi} - {faultArray[0].equipmentId}
                  </strong>
                </IonLabel>
              </IonCol>
              <IonCol className="ion-text-end ion-no-padding">
                <IonLabel>
                  {faultArray[0].geometry?.coordinates && (
                    <Link
                      to="/turvalaiteviat/"
                      onClick={(e) => {
                        e.preventDefault();
                        goto(faultArray[0].equipmentId);
                      }}
                    >
                      {faultArray[0].geometry?.coordinates[0] &&
                        faultArray[0].geometry?.coordinates[1] &&
                        coordinatesToStringHDM([faultArray[0].geometry?.coordinates[0], faultArray[0].geometry.coordinates[1]])}
                    </Link>
                  )}
                </IonLabel>
              </IonCol>
            </IonRow>
            {faultArray.map((fault) => (
              <IonRow key={fault.id}>
                <IonCol>
                  <IonLabel>{(fault.type && fault.type[lang]) || fault.type?.fi}</IonLabel>
                </IonCol>
                <IonCol className="ion-text-end ion-no-padding">
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
    </>
  );
};

type FaultsProps = {
  widePane?: boolean;
};

const SafetyEquipmentFaults: React.FC<FaultsProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const { data, isPending, dataUpdatedAt, isFetching } = useSafetyEquipmentFaultDataWithRelatedDataInvalidation();
  const path = [{ title: t('faults.title') }];
  const alertProps = getAlertProperties(dataUpdatedAt, 'safetyequipment');
  const { state } = useDvkContext();
  const safetyEquipmentLayer = useSafetyEquipmentLayer();

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps || !alertProps.duration) return t('warnings.viewLastUpdatedUnknown');
    return t('warnings.lastUpdatedAt', { val: alertProps.duration });
  }, [alertProps, t]);

  useEffect(() => {
    return () => {
      const dvkMap = getMap();
      const equipmentSource = dvkMap.getVectorSource('safetyequipment');
      equipmentSource.forEachFeature((f) => {
        f.set('faultListStyle', false, true);
        f.set('hoverStyle', false, true);
      });
      equipmentSource.dispatchEvent('change');
      dvkMap.getVectorSource('safetyequipmentfault').clear();
    };
  }, []);

  useEffect(() => {
    if (safetyEquipmentLayer.ready) {
      const dvkMap = getMap();
      const equipmentSource = dvkMap.getVectorSource('safetyequipment');
      const faultSource = dvkMap.getVectorSource('safetyequipmentfault');
      const safetyEquipments = equipmentSource.getFeatures();
      // Set safetyEquipmentFaultList prop to change feature styling
      safetyEquipments.forEach((f) => f.set('faultListStyle', !!f.get('faults'), true));
      equipmentSource.dispatchEvent('change');
      // Add equipment faults to separate layer
      const safetyEquipmentFaults = safetyEquipments.filter((feat) => !!feat.get('faults'));
      faultSource.clear();
      faultSource.addFeatures(safetyEquipmentFaults);
    }
  }, [safetyEquipmentLayer.ready, safetyEquipmentLayer.dataUpdatedAt]);

  useEffect(() => {
    getMap().getFeatureLayer('safetyequipmentfault').setVisible(!state.layers.includes('safetyequipment'));
  }, [state.layers]);

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{t('faults.title')}</strong>
        </h2>
        <em>
          {t('faults.modified')} {!isPending && !isFetching && <>{t('faults.datetimeFormat', { val: dataUpdatedAt })}</>}
          {(isPending || isFetching) && (
            <IonSkeletonText
              animated={true}
              style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
            />
          )}
        </em>
      </IonText>

      {alertProps && !isPending && !isFetching && (
        <Alert icon={alertIcon} color={alertProps.color} className={'top-margin ' + alertProps.color} title={getLayerItemAlertText()} />
      )}

      <div
        id="safetyEquipmentFaultList"
        className={'tabContent active show-print' + (widePane ? ' wide' : '')}
        data-testid="safetyEquipmentFaultList"
      >
        <FaultGroup loading={isPending} data={data?.safetyEquipmentFaults || []} />
      </div>
    </>
  );
};

export default SafetyEquipmentFaults;

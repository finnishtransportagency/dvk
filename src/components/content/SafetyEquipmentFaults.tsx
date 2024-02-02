import React, { useCallback, useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonLabel, IonText, IonSkeletonText, IonIcon } from '@ionic/react';
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
import { setSelectedSafetyEquipment } from '../layers';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { useSafetyEquipmentAndFaultLayer } from '../FeatureLoader';
import { InfoParagraph } from './Paragraph';
import { symbol2Icon } from '../layerStyles/safetyEquipmentStyles';

type FaultGroupProps = {
  data: SafetyEquipmentFault[];
  loading?: boolean;
  selectedFairwayCard: boolean;
};

function goto(id: number, selectedFairwayCard: boolean) {
  const dvkMap = getMap();
  const feature = dvkMap
    .getVectorSource(selectedFairwayCard ? 'selectedfairwaycard' : 'safetyequipmentfault')
    .getFeatureById(id) as Feature<Geometry>;
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

export const FaultGroup: React.FC<FaultGroupProps> = ({ data, loading, selectedFairwayCard }) => {
  const { t, i18n } = useTranslation();
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
  const equipmentSource = getMap().getVectorSource(selectedFairwayCard ? 'selectedfairwaycard' : 'safetyequipmentfault');
  return (
    <>
      {loading && <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>}
      {groupedFaults.map((faultArray) => {
        const feature = equipmentSource.getFeatureById(faultArray[0].equipmentId) as Feature<Geometry>;
        const equipment = feature?.getProperties() as EquipmentFeatureProperties | undefined;
        // check if symbol is not undefined and key in symbol2Icon structure
        // seems to be safe enough to justify disabling eslint and using symbol2Icon from safetyEquipmentStyles
        const symbol = equipment?.symbol !== undefined && equipment?.symbol in symbol2Icon ? equipment?.symbol : '?';
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
                        goto(faultArray[0].equipmentId, selectedFairwayCard);
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
            <IonGrid className="ion-no-padding">
              <IonRow>
                <IonCol size="1.5">
                  {/*eslint-disable-next-line  @typescript-eslint/no-explicit-any*/}
                  <IonIcon className="equipmentListIcon" src={(symbol2Icon as any)[symbol].icon} />
                </IonCol>
                <IonCol className="faultInfoCol">
                  {faultArray.map((fault, index) => (
                    <IonGrid key={fault.id} className="ion-no-padding">
                      {index === 0 && (
                        <IonRow>
                          <IonCol>
                            <IonLabel>
                              <strong>{t('faults.faultType')}</strong>
                            </IonLabel>
                          </IonCol>
                          <IonCol>
                            <IonLabel>
                              <strong>{t('faults.faultDateTime')}</strong>
                            </IonLabel>
                          </IonCol>
                        </IonRow>
                      )}
                      <IonRow>
                        <IonCol>
                          <IonLabel>{(fault.type && fault.type[lang]) || fault.type?.fi}</IonLabel>
                        </IonCol>
                        <IonCol>
                          <IonLabel>{t('faults.datetimeFormat', { val: fault.recordTime })}</IonLabel>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  ))}
                </IonCol>
              </IonRow>
              {!selectedFairwayCard && (
                <>
                  <IonRow>
                    <IonCol>
                      <strong>{t('faults.fairways')}</strong>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      {cards.length > 0 ? (
                        cards.map((card, idx) => (
                          <span key={card.id}>
                            <Link to={`/kortit/${card.id}`}>{card.name[lang]}</Link>
                            {idx < cards.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      ) : (
                        <IonText className="customInfoStyle">
                          <InfoParagraph />
                        </IonText>
                      )}
                    </IonCol>
                  </IonRow>
                </>
              )}
            </IonGrid>
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
  // both data fetched for the sake of same data on list and map
  const { data, isPending, dataUpdatedAt, isFetching } = useSafetyEquipmentFaultDataWithRelatedDataInvalidation();
  const { ready } = useSafetyEquipmentAndFaultLayer();
  const path = [{ title: t('faults.title') }];
  const alertProps = getAlertProperties(dataUpdatedAt, 'safetyequipmentfault');
  const { dispatch, state } = useDvkContext();

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps || !alertProps.duration) return t('warnings.viewLastUpdatedUnknown');
    return t('warnings.lastUpdatedAt', { val: alertProps.duration });
  }, [alertProps, t]);

  useEffect(() => {
    if (!state.layers.includes('safetyequipmentfault') && !isPending && !isFetching && ready) {
      const updatedLayers = [...state.layers, 'safetyequipmentfault'];
      dispatch({ type: 'setLayers', payload: { value: updatedLayers } });
    }
    // disable because of unnecessary callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, isPending, ready]);

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
        <FaultGroup loading={isPending} data={data?.safetyEquipmentFaults || []} selectedFairwayCard={false} />
      </div>
    </>
  );
};

export default SafetyEquipmentFaults;

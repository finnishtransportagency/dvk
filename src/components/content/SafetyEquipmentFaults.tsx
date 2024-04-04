import React, { useCallback, useEffect, useState } from 'react';
import { IonGrid, IonRow, IonCol, IonLabel, IonText, IonSkeletonText, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { SafetyEquipmentFault } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import { useSafetyEquipmentFaultDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import { coordinatesToStringHDM, filterFeaturesInPolygonByArea, sortByAlign, zoomToFeatureCoordinates } from '../../utils/coordinateUtils';
import Breadcrumb from './Breadcrumb';
import { getMap } from '../DvkMap';
import { Card, EquipmentFeatureProperties } from '../features';
import { Link } from 'react-router-dom';
import './SafetyEquipmentFaults.css';
import { useDvkContext } from '../../hooks/dvkContext';
import { setSelectedSafetyEquipment } from '../layers';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { useSafetyEquipmentAndFaultLayer, useVaylaWaterAreaData } from '../FeatureLoader';
import { InfoParagraph } from './Paragraph';
import { symbol2Icon } from '../layerStyles/safetyEquipmentStyles';
import CustomSelectDropdown from './CustomSelectDropdown';
import sortArrow from '../../theme/img/back_arrow-1.svg';
import PageHeader from './PageHeader';

type FaultGroupProps = {
  data: SafetyEquipmentFault[];
  loading?: boolean;
  selectedFairwayCard: boolean;
  sortNewFirst?: boolean;
};

function goto(id: number, selectedFairwayCard: boolean) {
  const dvkMap = getMap();
  const feature = dvkMap
    .getVectorSource(selectedFairwayCard ? 'selectedfairwaycard' : 'safetyequipmentfault')
    .getFeatureById(id) as Feature<Geometry>;
  if (feature) {
    zoomToFeatureCoordinates(feature, undefined, undefined);
  }
}

export const FaultGroup: React.FC<FaultGroupProps> = ({ data, loading, selectedFairwayCard, sortNewFirst }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  // Sort faults by recordTime (desc) if only one fault or
  // safety equipment fault page
  // and group faults by equipmentId
  const sortedFaults =
    data.length == 1 || !selectedFairwayCard
      ? [...data].sort((a, b) => {
          if (sortNewFirst) {
            return a.recordTime > b.recordTime ? -1 : 1;
          }
          return a.recordTime > b.recordTime ? 1 : -1;
        })
      : sortByAlign(data);

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
          <IonGrid
            className="table light group ion-no-padding inlineHoverText"
            key={faultArray[0].equipmentId}
            onMouseEnter={() => setSelectedSafetyEquipment(faultArray[0].equipmentId, true)}
            onFocus={() => setSelectedSafetyEquipment(faultArray[0].equipmentId, true)}
            onMouseLeave={() => setSelectedSafetyEquipment(faultArray[0].equipmentId, false)}
            onBlur={() => setSelectedSafetyEquipment(faultArray[0].equipmentId, false)}
          >
            <IonRow className="header">
              <IonCol className="ion-no-padding">
                <IonLabel>
                  <strong>
                    {faultArray[0].name?.[lang] ?? faultArray[0].name?.fi} - {faultArray[0].equipmentId}
                  </strong>
                </IonLabel>
              </IonCol>
              <IonCol className="ion-text-end ion-no-padding">
                <IonLabel>
                  {faultArray[0].geometry?.coordinates && (
                    <em>
                      <Link
                        to="/turvalaiteviat/"
                        onClick={(e) => {
                          e.preventDefault();
                          goto(faultArray[0].equipmentId, selectedFairwayCard);
                        }}
                      >
                        {faultArray[0].geometry?.coordinates[0] &&
                          faultArray[0].geometry?.coordinates[1] &&
                          coordinatesToStringHDM([faultArray[0].geometry?.coordinates[0], faultArray[0].geometry.coordinates[1]]).replace('N', 'N /')}
                      </Link>
                    </em>
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
                          <IonLabel>{fault.type?.[lang] ?? fault.type?.fi}</IonLabel>
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
  const { dispatch, state } = useDvkContext();
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [sortNewFirst, setSortNewFirst] = useState<boolean>(true);
  const areaPolygons = useVaylaWaterAreaData();

  const filterDataByArea = useCallback(() => {
    if (areaFilter.length < 1) {
      return data?.safetyEquipmentFaults;
    }
    return filterFeaturesInPolygonByArea(areaPolygons.data, data?.safetyEquipmentFaults, areaFilter);
  }, [areaPolygons, data?.safetyEquipmentFaults, areaFilter]);

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
      <PageHeader
        title={t('faults.title')}
        layerId="safetyequipmentfault"
        isPending={isPending}
        isFetching={isFetching}
        dataUpdatedAt={dataUpdatedAt}
      />

      <IonGrid className="faultFilterContainer">
        <IonRow className="ion-align-items-center">
          <IonCol size="10.5">
            <IonText className="filterTitle">{t('warnings.area')}</IonText>
            <CustomSelectDropdown triggerId="popover-container-equipment-area" selected={areaFilter} setSelected={setAreaFilter} />
          </IonCol>
          <IonCol size="1.5">
            <button
              id="faultSortingButton"
              className="faultSortingButton"
              onClick={(e) => {
                setSortNewFirst(!sortNewFirst);
                e.preventDefault();
              }}
              title={sortNewFirst ? t('common.sortOldToNew') : t('common.sortNewToOld')}
            >
              <IonIcon slot="icon-only" className={'sortingIcon ' + (sortNewFirst ? 'flipped' : '')} src={sortArrow} />
            </button>
          </IonCol>
        </IonRow>
      </IonGrid>
      <div
        id="safetyEquipmentFaultList"
        className={'tabContent active show-print' + (widePane ? ' wide' : '')}
        data-testid="safetyEquipmentFaultList"
      >
        <FaultGroup loading={isPending} data={filterDataByArea() ?? []} selectedFairwayCard={false} sortNewFirst={sortNewFirst} />
      </div>
    </>
  );
};

export default SafetyEquipmentFaults;

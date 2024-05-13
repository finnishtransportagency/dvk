import React, { useEffect, useState } from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardPartsFragment, HarborPartsFragment, SafetyEquipmentFault } from '../../../graphql/generated';
import { isMobile } from '../../../utils/common';
import { setSelectedFairwayCard } from '../../layers';
import { Lang, MAP } from '../../../utils/constants';
import PrintMap from '../../PrintMap';
import Breadcrumb from '../Breadcrumb';
import Paragraph, { InfoParagraph } from '../Paragraph';
import { useDvkContext } from '../../../hooks/dvkContext';
import { VTSInfo } from './VTSInfo';
import { GeneralInfo } from './GeneralInfo';
import { AnchorageInfo } from './AnchorageInfo';
import { SpeedLimitInfo } from './SpeedLimitInfo';
import { ProhibitionInfo } from './ProhibitionInfo';
import { DimensionInfo } from './DimensionInfo';
import { LiningInfo } from './LiningInfo';
import { AreaInfo } from './AreaInfo';
import { PilotInfo } from './PilotInfo';
import { TugInfo } from './TugInfo';
import { HarbourInfo } from './HarbourInfo';
import { Alert } from './Alert';
import {
  getFairwayCardPilotRoutes,
  getTabLabel,
  getFairwayCardPilotageLimits,
  getFairwayCardSafetyEquipmentFaults,
} from '../../../utils/fairwayCardUtils';
import PendingPlaceholder from './PendingPlaceholder';
import { FairwayCardHeader } from './FairwayCardHeader';
import { SafetyEquipmentFaultAlert } from './SafetyEquipmentFaultAlert';
import { useSafetyEquipmentFaultDataWithRelatedDataInvalidation } from '../../../utils/dataLoader';
import { TabSwiper } from './TabSwiper';
import PilotRouteList from '../PilotRouteList';
import { usePilotRouteFeatures } from '../../PilotRouteFeatureLoader';
import { Feature } from 'ol';
import { Geometry, LineString } from 'ol/geom';
import { usePilotageLimitFeatures } from '../../PilotageLimitFeatureLoader';
import { useSafetyEquipmentAndFaultFeatures } from '../../SafetyEquipmentFeatureLoader';
import NotificationAlert from '../../Alert';
import infoIcon from '../../../theme/img/info.svg';
import uniqueId from 'lodash/uniqueId';

interface FairwayCardContentProps {
  fairwayCardId: string;
  fairwayCard: FairwayCardPartsFragment | undefined;
  isPending: boolean;
  dataUpdatedAt: number;
  isFetching: boolean;
  printDisabled: boolean;
  widePane?: boolean;
}
export const FairwayCardContent: React.FC<FairwayCardContentProps> = ({
  fairwayCardId,
  fairwayCard,
  isPending,
  dataUpdatedAt,
  isFetching,
  widePane,
  printDisabled,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { state } = useDvkContext();
  const [tab, setTab] = useState<number>(1);
  const [safetyEquipmentFaults, setSafetyEquipmentFaults] = useState<SafetyEquipmentFault[]>([]);
  const [pilotageLimits, setPilotageLimits] = useState<Feature<Geometry>[]>([]);
  const [pilotRoutes, setPilotRoutes] = useState<Feature<Geometry>[]>([]);

  const {
    data: safetyEquipmentData,
    dataUpdatedAt: faultDataUpdatedAt,
    isPending: faultIsPending,
    isFetching: faultIsFetching,
  } = useSafetyEquipmentFaultDataWithRelatedDataInvalidation();
  const { safetyEquipmentFaultFeatures, ready: safetyEquipmentsReady } = useSafetyEquipmentAndFaultFeatures();
  const { pilotageLimitFeatures, ready: pilotageLimitsReady } = usePilotageLimitFeatures();
  const { pilotRouteFeatures, ready: pilotRoutesReady } = usePilotRouteFeatures();

  useEffect(() => {
    if (fairwayCard && safetyEquipmentsReady && !faultIsPending && !faultIsFetching) {
      const features = getFairwayCardSafetyEquipmentFaults(fairwayCard, safetyEquipmentFaultFeatures);
      const faultIds = features.map((f) => f.getId() as number);
      const equipmentFaults = safetyEquipmentData?.safetyEquipmentFaults?.filter((eq) => faultIds.includes(eq.equipmentId)) ?? [];
      setSafetyEquipmentFaults(equipmentFaults);
    }
  }, [fairwayCard, safetyEquipmentsReady, safetyEquipmentFaultFeatures, safetyEquipmentData, faultIsPending, faultIsFetching]);

  useEffect(() => {
    if (fairwayCard && pilotageLimitsReady) {
      const features = getFairwayCardPilotageLimits(fairwayCard, pilotageLimitFeatures);
      const limits: Feature<Geometry>[] = features
        .map((l) => {
          // Feature.clone(): Feature geometry is cloned, but properties and style are original. Id is not set.
          const f = l.clone();
          const geometry = f.getGeometry() as Geometry;
          f.setGeometry(geometry.transform(MAP.EPSG, 'EPSG:4326') as LineString);
          f.setId(l.getId());
          return f;
        })
        .sort((a, b) => a.getProperties().numero - b.getProperties().numero);
      setPilotageLimits(limits);
    }
  }, [pilotageLimitsReady, pilotageLimitFeatures, fairwayCard]);

  useEffect(() => {
    if (fairwayCard && pilotRoutesReady) {
      setPilotRoutes(getFairwayCardPilotRoutes(fairwayCard, pilotRouteFeatures));
    }
  }, [fairwayCard, pilotRouteFeatures, pilotRoutesReady]);

  const isN2000HeightSystem = !!fairwayCard?.n2000HeightSystem;
  const lang = i18n.resolvedLanguage as Lang;
  const modifiedInfo =
    t('modified') +
    ' ' +
    t('modifiedDate', {
      val: fairwayCard?.modificationTimestamp ? fairwayCard?.modificationTimestamp : '-',
    });
  const heightSystemInfo = isN2000HeightSystem ? 'N2000 (BSCD2000)' : 'MW';
  const updatedInfo = t('dataUpdated') + (!isPending && !isFetching ? ' ' + t('datetimeFormat', { val: dataUpdatedAt }) : '');

  const getTabClassName = (tabId: number): string => {
    return 'tabContent tab' + tabId + (widePane ? ' wide' : '') + (tab === tabId ? ' active' : '');
  };

  const isExpired = (date: string | null | undefined): boolean => {
    if (!date) {
      return false;
    }
    // compare only day, month and year
    const endDate = new Date(date).setHours(0, 0, 0, 0);
    const currentDate = new Date().setHours(0, 0, 0, 0);

    return currentDate > endDate;
  };

  const path = [
    {
      title: t('title', { count: 0 }),
      route: '/kortit/',
    },
    {
      title: fairwayCard?.name[lang] ?? fairwayCard?.name.fi ?? '',
      route: '/kortit/' + fairwayCardId,
      onClick: () => {
        setSelectedFairwayCard(fairwayCard);
      },
    },
    {
      title: getTabLabel(t, tab),
    },
  ];

  return (
    <>
      {isPending && <PendingPlaceholder widePane={widePane} />}
      {!isPending && !fairwayCard && <Alert fairwayCardId={fairwayCardId} />}
      {!isPending && fairwayCard && (
        <>
          <Breadcrumb path={path} />
          <FairwayCardHeader
            fairwayTitle={fairwayCard?.name[lang] ?? fairwayCardId}
            infoText1={state.preview ? t('preview') : modifiedInfo + ' - ' + heightSystemInfo}
            infoText2={state.preview ? '-' : updatedInfo}
            isPending={isPending}
            isFetching={isFetching}
            printDisabled={printDisabled}
          />
          {fairwayCard?.temporaryNotifications?.map((notification) => {
            const content = notification?.content?.[lang];
            const uuid = uniqueId('notification_');
            if (content && !isExpired(notification.endDate)) {
              return (
                <NotificationAlert
                  key={uuid}
                  title={content}
                  icon={infoIcon}
                  className="top-margin info"
                  startDate={notification.startDate ?? ''}
                  endDate={notification.endDate ?? ''}
                />
              );
            }
          })}
          {safetyEquipmentFaults.length > 0 && !faultIsPending && !faultIsFetching && (
            <div className="no-print">
              <SafetyEquipmentFaultAlert
                data={safetyEquipmentFaults}
                dataUpdatedAt={faultDataUpdatedAt}
                isPending={faultIsPending}
                widePane={widePane}
              />
            </div>
          )}

          <TabSwiper tab={tab} setTab={setTab} widePane={widePane} />

          <div className={getTabClassName(1)}>
            <IonText className="no-margin-top">
              <h4>
                <strong>{t('information')}</strong>
              </h4>
            </IonText>
            <LiningInfo data={fairwayCard?.fairways} lineText={fairwayCard?.lineText} />
            <DimensionInfo data={fairwayCard?.fairways} designSpeedText={fairwayCard?.designSpeed} isN2000HeightSystem={isN2000HeightSystem} />
            <IonText>
              <Paragraph title={t('attention')} bodyText={fairwayCard?.attention ?? undefined} />
              <ProhibitionInfo data={fairwayCard?.fairways} inlineLabel />
              <SpeedLimitInfo data={fairwayCard?.fairways} speedLimitText={fairwayCard?.speedLimit} inlineLabel />
              <AnchorageInfo data={fairwayCard?.fairways} anchorageText={fairwayCard?.anchorage} inlineLabel />
            </IonText>

            <IonText>
              <h4>
                <strong>{t('navigation')}</strong>
              </h4>
              <Paragraph bodyText={fairwayCard?.generalInfo ?? undefined} />
              <Paragraph title={t('navigationCondition')} bodyText={fairwayCard?.navigationCondition ?? undefined} showNoData />
              <Paragraph title={t('iceCondition')} bodyText={fairwayCard?.iceCondition ?? undefined} showNoData />
            </IonText>

            <IonText>
              <h4>
                <strong>
                  {t('recommendations')} <span>({t('fairwayAndHarbour').toLocaleLowerCase()})</span>
                </strong>
              </h4>
              <Paragraph title={t('windRecommendation')} bodyText={fairwayCard?.windRecommendation ?? undefined} showNoData />
              <Paragraph title={t('vesselRecommendation')} bodyText={fairwayCard?.vesselRecommendation ?? undefined} showNoData />
              <Paragraph title={t('visibilityRecommendation')} bodyText={fairwayCard?.visibility ?? undefined} showNoData />
              <Paragraph title={t('windGauge')} bodyText={fairwayCard?.windGauge ?? undefined} showNoData />
              <Paragraph title={t('seaLevel')} bodyText={fairwayCard?.seaLevel ?? undefined} showNoData />
            </IonText>

            {fairwayCard?.additionalInfo && (
              <IonText>
                <h4>
                  <strong>{t('additionalInfo')}</strong>
                </h4>
                <Paragraph bodyText={fairwayCard?.additionalInfo ?? undefined} />
              </IonText>
            )}
            <IonText>
              <h4>
                <strong>{t('trafficServices')}</strong>
              </h4>
            </IonText>
            <PilotInfo pilotageLimits={pilotageLimits} pilot={fairwayCard?.trafficService?.pilot} />
            <VTSInfo data={fairwayCard?.trafficService?.vts} />
            <TugInfo data={fairwayCard?.trafficService?.tugs} />
          </div>

          <div className={getTabClassName(2)}>
            {fairwayCard?.harbors?.map((harbour: HarborPartsFragment | null | undefined, idx: React.Key) => {
              return <HarbourInfo data={harbour} key={harbour?.id} isLast={fairwayCard.harbors?.length === Number(idx) + 1} />;
            })}
            {(!fairwayCard?.harbors || fairwayCard?.harbors?.length === 0) && (
              <IonText className="no-print">
                <InfoParagraph />
              </IonText>
            )}
          </div>

          <div className={getTabClassName(3)}>
            <IonText className="no-margin-top">
              <h5>{t('commonInformation')}</h5>
              <GeneralInfo data={fairwayCard?.fairways} />
              <ProhibitionInfo data={fairwayCard?.fairways} />
            </IonText>
            <IonText>
              <h5>{t('speedLimit')}</h5>
              <SpeedLimitInfo data={fairwayCard?.fairways} speedLimitText={fairwayCard?.speedLimit} />
            </IonText>
            <IonText>
              <h5>{t('anchorage')}</h5>
              <AnchorageInfo data={fairwayCard?.fairways} anchorageText={fairwayCard?.anchorage} />
            </IonText>
            <IonText>
              <h5>{t('fairwayAreas')}</h5>
            </IonText>
            <AreaInfo data={fairwayCard?.fairways} />
          </div>

          <div className={getTabClassName(4)}>
            {import.meta.env.VITE_APP_ENV !== 'prod' && pilotRoutesReady && (
              <>
                {pilotRoutes.length > 0 ? (
                  <PilotRouteList pilotRoutes={pilotRoutes} featureLink={'/kortit/' + fairwayCardId} layerId="selectedfairwaycard" />
                ) : (
                  <IonText className="no-print">
                    <InfoParagraph />
                  </IonText>
                )}
              </>
            )}
          </div>

          {!isMobile() && (
            <>
              <div className="pagebreak" />
              <PrintMap
                id={fairwayCard?.id}
                pictures={fairwayCard?.pictures
                  ?.filter((p) => p.sequenceNumber !== null && p.sequenceNumber !== undefined)
                  .sort((a, b) => (a.sequenceNumber as number) - (b.sequenceNumber as number))}
                name={fairwayCard?.name ?? undefined}
                modified={fairwayCard?.modificationTimestamp ?? undefined}
                isN2000={isN2000HeightSystem}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

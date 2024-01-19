import React, { useEffect, useState } from 'react';
import { IonLabel, IonSegment, IonSegmentButton, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardPartsFragment, HarborPartsFragment, SafetyEquipmentFault } from '../../../graphql/generated';
import { isMobile } from '../../../utils/common';
import { setSelectedFairwayCard } from '../../layers';
import { Lang } from '../../../utils/constants';
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
import { getSafetyEquipmentFaultsByFairwayCardId, getTabLabel } from '../../../utils/fairwayCardUtils';
import PendingPlaceholder from './PendingPlaceholder';
import { FairwayCardHeader } from './FairwayCardHeader';
import { SafetyEquipmentFaultAlert } from './SafetyEquipmentFaultAlert';
import { useSafetyEquipmentFaultDataWithRelatedDataInvalidation } from '../../../utils/dataLoader';

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

  const {
    dataUpdatedAt: faultDataUpdatedAt,
    isPending: faultIsPending,
    isFetching: faultIsFetching,
  } = useSafetyEquipmentFaultDataWithRelatedDataInvalidation();

  useEffect(() => {
    setSafetyEquipmentFaults(getSafetyEquipmentFaultsByFairwayCardId(fairwayCardId));
  }, [fairwayCardId]);

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
          {safetyEquipmentFaults.length > 0 && !faultIsPending && !faultIsFetching && (
            <SafetyEquipmentFaultAlert data={safetyEquipmentFaults} dataUpdatedAt={faultDataUpdatedAt} widePane={widePane} />
          )}
          <IonSegment className="tabs" onIonChange={(e) => setTab((e.detail.value as number) ?? 1)} value={tab} data-testid="tabChange">
            {[1, 2, 3].map((tabId) => (
              <IonSegmentButton key={tabId} value={tabId}>
                <IonLabel>
                  <h3>{getTabLabel(t, tabId)}</h3>
                </IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

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
                  {t('recommendations')} <span>({t('fairwayAndHarbour')})</span>
                </strong>
              </h4>
              <Paragraph title={t('windRecommendation')} bodyText={fairwayCard?.windRecommendation ?? undefined} showNoData />
              <Paragraph title={t('vesselRecommendation')} bodyText={fairwayCard?.vesselRecommendation ?? undefined} showNoData />
              <Paragraph title={t('visibilityRecommendation')} bodyText={fairwayCard?.visibility ?? undefined} showNoData />
              <Paragraph title={t('windGauge')} bodyText={fairwayCard?.windGauge ?? undefined} showNoData />
              <Paragraph title={t('seaLevel')} bodyText={fairwayCard?.seaLevel ?? undefined} showNoData />
            </IonText>

            <IonText>
              <h4>
                <strong>{t('trafficServices')}</strong>
              </h4>
            </IonText>
            <PilotInfo data={fairwayCard?.trafficService?.pilot} />
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
              <h5>{t('speedLimit')}</h5>
              <SpeedLimitInfo data={fairwayCard?.fairways} speedLimitText={fairwayCard?.speedLimit} />
              <h5>{t('anchorage')}</h5>
              <AnchorageInfo data={fairwayCard?.fairways} anchorageText={fairwayCard?.anchorage} />
              <h5>{t('fairwayAreas')}</h5>
              <AreaInfo data={fairwayCard?.fairways} />
            </IonText>
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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FairwayCardPartsFragment, SafetyEquipmentFault, SquatCalculation } from '../../../graphql/generated';
import { isMobile } from '../../../utils/common';
import { setSelectedFairwayCard } from '../../fairwayCardSetter';
import { Lang } from '../../../utils/constants';
import PrintMap from '../../PrintMap';
import Breadcrumb from '../Breadcrumb';
import { useDvkContext } from '../../../hooks/dvkContext';
import { Alert } from './Alert';
import { getTabLabel, getFairwayCardSafetyEquipmentFaults, getValidSquatCalculations } from '../../../utils/fairwayCardUtils';
import PendingPlaceholder from './PendingPlaceholder';
import { FairwayCardHeader } from './FairwayCardHeader';
import { SafetyEquipmentFaultAlert } from './SafetyEquipmentFaultAlert';
import { useSafetyEquipmentFaultDataWithRelatedDataInvalidation } from '../../../utils/dataLoader';
import { TabSwiper } from './TabSwiper';
import { useSafetyEquipmentAndFaultFeatures } from '../../SafetyEquipmentFeatureLoader';
import NotificationAlert from '../../Alert';
import infoIcon from '../../../theme/img/info.svg';
import { compareAsc } from 'date-fns';
import { FairwayCardInformationTab } from './tabs/FairwayCardInformationTab';
import { FairwayCardHarbourTab } from './tabs/FairwayCardHarbourTab';
import { FairwayCardCommonInformationTab } from './tabs/FairwayCardCommonInformationTab';
import { FairwayCardPilotRoutesTab } from './tabs/FairwayCardPilotRoutesTab';
import { FairwayCardSquatCalculationTab } from './tabs/FairwayCardSquatCalculationTab';
import { FairwayCardWeatherForecastTab } from './tabs/FairwayCardWeatherForecastTab';

export enum FairwayCardTab {
  Information = 1,
  Harbours = 2,
  CommonInformation = 3,
  PilotRoutes = 4,
  SquatCalculation = 5,
  WeatherForecasts = 6,
}

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
  const [tab, setTab] = useState<FairwayCardTab>(FairwayCardTab.Information);
  const [safetyEquipmentFaults, setSafetyEquipmentFaults] = useState<SafetyEquipmentFault[]>([]);

  const {
    data: safetyEquipmentData,
    dataUpdatedAt: faultDataUpdatedAt,
    isPending: faultIsPending,
    isFetching: faultIsFetching,
  } = useSafetyEquipmentFaultDataWithRelatedDataInvalidation();
  const { safetyEquipmentFaultFeatures, ready: safetyEquipmentsReady } = useSafetyEquipmentAndFaultFeatures();

  useEffect(() => {
    if (fairwayCard && safetyEquipmentsReady && !faultIsPending && !faultIsFetching) {
      const features = getFairwayCardSafetyEquipmentFaults(fairwayCard, safetyEquipmentFaultFeatures);
      const faultIds = features.map((f) => f.getId() as number);
      const equipmentFaults = safetyEquipmentData?.safetyEquipmentFaults?.filter((eq) => faultIds.includes(eq.equipmentId)) ?? [];
      setSafetyEquipmentFaults(equipmentFaults);
    }
  }, [fairwayCard, safetyEquipmentsReady, safetyEquipmentFaultFeatures, safetyEquipmentData, faultIsPending, faultIsFetching]);

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

  const getTabClassName = (tabId: FairwayCardTab): string => {
    return 'tabContent tab' + tabId + (widePane ? ' wide' : '') + (tab === tabId ? ' active' : '');
  };

  // if notice is expired or start date after current date, return false
  const isValidToDisplay = (startDate: string | null | undefined, endDate: string | null | undefined): boolean => {
    if (!startDate) {
      return false;
    }
    // from date-fns documentation:
    // Compare the two dates and return 1 if the first date is after the second, -1 if the first date is before the second or 0 if dates are equal.
    endDate = endDate?.split('T')[0];
    startDate = startDate?.split('T')[0];
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const startDateCompare = compareAsc(new Date(startDate).setHours(0, 0, 0, 0), currentDate);
    const endDateCompare = endDate ? compareAsc(currentDate, new Date(endDate).setHours(0, 0, 0, 0)) : -1;

    if (startDateCompare < 1 && endDateCompare < 1) {
      return true;
    }

    return false;
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

  //Check validity of squat calculation templates
  //all Areas
  const validSquats: SquatCalculation[] | undefined = fairwayCard ? getValidSquatCalculations(fairwayCard) : [];

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
            fairwayIds={fairwayCard.fairways?.map((ff) => ff.id)}
          />
          {fairwayCard?.temporaryNotifications?.map((notification, idx) => {
            if (notification.content && isValidToDisplay(notification.startDate, notification.endDate)) {
              return (
                <NotificationAlert
                  key={'notification' + idx}
                  title={notification.content[lang] ?? ''}
                  icon={infoIcon}
                  className="top-margin info no-print"
                  startDate={notification.startDate ?? ''}
                  endDate={notification.endDate ?? ''}
                  markdownText={notification.content}
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

          <div className={getTabClassName(FairwayCardTab.Information)}>
            <FairwayCardInformationTab fairwayCard={fairwayCard} isN2000HeightSystem={isN2000HeightSystem} />
          </div>

          <div className={getTabClassName(FairwayCardTab.Harbours)}>
            <FairwayCardHarbourTab fairwayCard={fairwayCard} />
          </div>

          <div className={getTabClassName(FairwayCardTab.CommonInformation)}>
            <FairwayCardCommonInformationTab fairwayCard={fairwayCard} />
          </div>

          <div className={getTabClassName(FairwayCardTab.PilotRoutes)}>
            <FairwayCardPilotRoutesTab fairwayCard={fairwayCard} fairwayCardId={fairwayCardId} />
          </div>

          <div className={getTabClassName(FairwayCardTab.SquatCalculation) + ((validSquats ?? []).length > 0 ? '' : ' onecolumn')}>
            <FairwayCardSquatCalculationTab fairwayCard={fairwayCard} validSquats={validSquats ?? []} />
          </div>

          <div className={getTabClassName(FairwayCardTab.WeatherForecasts)}>
            <FairwayCardWeatherForecastTab fairwayCard={fairwayCard} />
          </div>

          {!isMobile() && (
            <>
              <div className="pagebreak" />
              <PrintMap
                id={fairwayCard?.id}
                version={fairwayCard?.currentPublic ? `v${fairwayCard?.currentPublic}` : fairwayCard?.version}
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

import React, { useState } from 'react';
import { IonBreadcrumbs, IonButton, IonCol, IonGrid, IonLabel, IonRow, IonSegment, IonSegmentButton, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardPartsFragment, HarborPartsFragment } from '../../../graphql/generated';
import PrintIcon from '../../../theme/img/print.svg?react';
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

  const isN2000HeightSystem = !!fairwayCard?.n2000HeightSystem;
  const lang = i18n.resolvedLanguage as Lang;

  const getTabClassName = (tabId: number): string => {
    return 'tabContent tab' + tabId + (widePane ? ' wide' : '') + (tab === tabId ? ' active' : '');
  };

  const getTabLabel = (tabId: number): string => {
    switch (tabId) {
      case 1:
        return t('title', { count: 1 });
      case 2:
        return t('harboursTitle');
      case 3:
        return t('areasTitle');
      default:
        return '-';
    }
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
      title: getTabLabel(tab),
    },
  ];

  return (
    <>
      {isPending && (
        <>
          <IonBreadcrumbs>
            <IonSkeletonText animated={true} style={{ width: '100%', height: widePane ? '24px' : '48px', margin: '0' }}></IonSkeletonText>
          </IonBreadcrumbs>
          <IonText className="fairwayTitle">
            <h2 className="no-margin-bottom">
              <IonSkeletonText animated={true} style={{ width: '100%', height: '30px' }}></IonSkeletonText>
            </h2>
            <IonSkeletonText animated={true} style={{ width: '150px', height: '14px', margin: '0' }}></IonSkeletonText>
          </IonText>
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50px', marginTop: '20px' }}></IonSkeletonText>
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50vh', marginTop: '20px' }}></IonSkeletonText>
        </>
      )}
      {!isPending && !fairwayCard && <Alert fairwayCardId={fairwayCardId} />}
      {!isPending && fairwayCard && (
        <>
          <Breadcrumb path={path} />
          <IonGrid className="ion-no-padding ion-margin-top">
            <IonRow>
              <IonCol>
                <IonText className="fairwayTitle" id="mainPageContent">
                  <h2 className="ion-no-margin">
                    <strong>{fairwayCard?.name[lang]}</strong>
                  </h2>
                </IonText>
              </IonCol>
              <IonCol size="auto" className="ion-align-self-end">
                <IonButton
                  fill="clear"
                  className="icon-only small no-mobile no-print"
                  onClick={() => window.print()}
                  title={t('print')}
                  aria-label={t('print')}
                  data-testid="printButton"
                  disabled={printDisabled}
                >
                  <PrintIcon />
                </IonButton>
                <IonText className="fairwayTitle printable">
                  <h3 className="no-margin-bottom">{t('title', { count: 1 })}</h3>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonText className="fairwayTitle">
                  {state.preview ? (
                    <>
                      <em id="emphasizedPreviewText">{t('preview')}</em>
                      <br />
                      <em>-</em>
                    </>
                  ) : (
                    <>
                      <em>
                        {t('modified')}{' '}
                        {t('modifiedDate', {
                          val: fairwayCard?.modificationTimestamp ? fairwayCard?.modificationTimestamp : '-',
                        })}
                        {isN2000HeightSystem ? ' - N2000 (BSCD2000)' : ' - MW'}
                      </em>
                      <br />
                      <em className="no-print">
                        {t('dataUpdated')} {!isPending && !isFetching && <>{t('datetimeFormat', { val: dataUpdatedAt })}</>}
                        {(isPending || isFetching) && (
                          <IonSkeletonText
                            animated={true}
                            style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
                          />
                        )}
                      </em>
                    </>
                  )}
                </IonText>
              </IonCol>
              <IonCol size="auto" className="ion-align-self-start">
                <IonText className="fairwayTitle">
                  <em>{t('notForNavigation')}</em>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonSegment className="tabs" onIonChange={(e) => setTab((e.detail.value as number) ?? 1)} value={tab} data-testid="tabChange">
            {[1, 2, 3].map((tabId) => (
              <IonSegmentButton key={tabId} value={tabId}>
                <IonLabel>
                  <h3>{getTabLabel(tabId)}</h3>
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

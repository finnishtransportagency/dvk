import { IonText } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { LiningInfo } from './LiningInfo';
import { DimensionInfo } from './DimensionInfo';
import Paragraph from '../../Paragraph';
import { ProhibitionInfo } from '../commonInformationTab/ProhibitionInfo';
import { SpeedLimitInfo } from '../commonInformationTab/SpeedLimitInfo';
import { AnchorageInfo } from '../commonInformationTab/AnchorageInfo';
import { ObservationInfo } from './ObservationInfo';
import MareographInfo from './MareographInfo';
import MarkdownParagraph from '../../MarkdownParagraph';
import { PilotInfo } from './PilotInfo';
import { VTSInfo } from './VTSInfo';
import { TugInfo } from './TugInfo';
import { useTranslation } from 'react-i18next';
import { FairwayCardPartsFragment } from '../../../../graphql/generated';
import { Feature } from 'ol';
import { Geometry, LineString } from 'ol/geom';
import { usePilotageLimitFeatures } from '../../../PilotageLimitFeatureLoader';
import { useObservationFeatures } from '../../../ObservationFeatureLoader';
import { useMareographFeatures } from '../../../MareographFeatureLoader';
import { MAP } from '../../../../utils/constants';
import { getFairwayCardMareographs, getFairwayCardObservations, getFairwayCardPilotageLimits } from '../../../../utils/fairwayCardUtils';

interface InformationTabProps {
  fairwayCard: FairwayCardPartsFragment;
  isN2000HeightSystem: boolean;
}
export const InformationTab: React.FC<InformationTabProps> = ({ fairwayCard, isN2000HeightSystem }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const [pilotageLimits, setPilotageLimits] = useState<Feature<Geometry>[]>([]);
  const [observations, setObservations] = useState<Feature<Geometry>[]>([]);
  const [mareographs, setMareographs] = useState<Feature<Geometry>[]>([]);
  const { pilotageLimitFeatures, ready: pilotageLimitsReady } = usePilotageLimitFeatures();
  const { observationFeatures, ready: observationsReady } = useObservationFeatures();
  const { mareographFeatures, ready: mareographsReady } = useMareographFeatures();

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
    if (fairwayCard && observationsReady) {
      setObservations(getFairwayCardObservations(fairwayCard, observationFeatures));
    }
  }, [observationsReady, observationFeatures, fairwayCard]);

  useEffect(() => {
    if (fairwayCard && mareographsReady) {
      setMareographs(getFairwayCardMareographs(fairwayCard, mareographFeatures));
    }
  }, [mareographsReady, mareographFeatures, fairwayCard]);

  return (
    <>
      <IonText className="no-margin-top">
        <h4>
          <strong>{t('information')}</strong>
        </h4>
      </IonText>
      <LiningInfo data={fairwayCard?.fairways} lineText={fairwayCard?.lineText} />
      <DimensionInfo data={fairwayCard?.fairways} designSpeedText={fairwayCard?.designSpeed} isN2000HeightSystem={isN2000HeightSystem} />
      <IonText>
        <Paragraph title={t('attention')} bodyText={fairwayCard?.attention ?? undefined} />
        <ProhibitionInfo data={fairwayCard?.fairways} inlineLabel data-testid="prohibitionAreas" />
        <SpeedLimitInfo data={fairwayCard?.fairways} speedLimitText={fairwayCard?.speedLimit} inlineLabel data-testid="speedLimit" />
        <AnchorageInfo data={fairwayCard?.fairways} anchorageText={fairwayCard?.anchorage} inlineLabel />
      </IonText>
      <IonText data-testid="navigation">
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
        <ObservationInfo observations={observations} />
        <MareographInfo mareographs={mareographs} />
      </IonText>
      {fairwayCard?.additionalInfo && (
        <IonText>
          <h4>
            <strong>{t('additionalInfo')}</strong>
          </h4>
          <MarkdownParagraph markdownText={fairwayCard?.additionalInfo} />
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
    </>
  );
};

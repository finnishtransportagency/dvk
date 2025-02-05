import { IonText } from '@ionic/react';
import React from 'react';
import { FairwayCardPartsFragment } from '../../../../graphql/generated';
import { GeneralInfo } from './GeneralInfo';
import { ProhibitionInfo } from './ProhibitionInfo';
import { AreaInfoByType } from './AreaInfoByType';
import { SpeedLimitInfo } from './SpeedLimitInfo';
import { AnchorageInfo } from './AnchorageInfo';
import { AreaInfo } from './AreaInfo';
import { useTranslation } from 'react-i18next';

interface FairwayCardCommonInformationTabProps {
  fairwayCard: FairwayCardPartsFragment;
}
export const FairwayCardCommonInformationTab: React.FC<FairwayCardCommonInformationTabProps> = ({ fairwayCard }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  return (
    <>
      <IonText className="no-margin-top">
        <h5>{t('commonInformation')}</h5>
        <GeneralInfo data={fairwayCard?.fairways} />
        <ProhibitionInfo data={fairwayCard?.fairways} />
        {/* 15 === prohibition area typecode*/}
        <AreaInfoByType data={fairwayCard?.fairways ?? []} typeCode={15} />
      </IonText>
      <IonText>
        <h5>{t('speedLimit')}</h5>
        <SpeedLimitInfo data={fairwayCard?.fairways} speedLimitText={fairwayCard?.speedLimit} />
      </IonText>
      <IonText>
        <h5>{t('anchorage')}</h5>
        <AnchorageInfo data={fairwayCard?.fairways} anchorageText={fairwayCard?.anchorage} />
        {/* 2 === special area typecode*/}
        <AreaInfoByType data={fairwayCard?.fairways ?? []} typeCode={2} />
      </IonText>
      <IonText>
        <h5>{t('fairwayAreas')}</h5>
      </IonText>
      <AreaInfo data={fairwayCard?.fairways} />
    </>
  );
};

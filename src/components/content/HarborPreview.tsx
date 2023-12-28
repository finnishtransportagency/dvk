import { IonText, IonSkeletonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFairwayCardListData } from '../../utils/dataLoader';
import GeneralInfoAccordion from './GeneralInfoAccordion';
import Breadcrumb from './Breadcrumb';

type HarborPreviewProps = {
  id?: string;
  widePane?: boolean;
};

const HarborPreview: React.FC<HarborPreviewProps> = ({ id, widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { isPending, dataUpdatedAt, isFetching } = useFairwayCardListData();
  const path = [{ title: t('title', { count: 0 }) }];

  console.log(id);

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle">
        <h2 className="no-margin-bottom">
          <strong>{t('title', { count: 0 })}</strong>
        </h2>
        <em className="no-print">
          {t('dataUpdated')} {!isPending && !isFetching && <>{t('datetimeFormat', { val: dataUpdatedAt })}</>}
          {(isPending || isFetching) && (
            <IonSkeletonText
              animated={true}
              style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
            />
          )}
        </em>
      </IonText>
      <GeneralInfoAccordion
        description={t('description')}
        additionalDesc={t('additionalDescription')}
        notification={t('notification')}
        widePane={widePane}
      />

      <div className={'tabContent active show-print' + (widePane ? ' wide' : '')}></div>
    </>
  );
};

export default HarborPreview;

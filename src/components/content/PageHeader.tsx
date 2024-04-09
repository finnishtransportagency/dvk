import React, { useCallback } from 'react';
import { IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getAlertProperties } from '../../utils/common';
import { FeatureDataLayerId } from '../../utils/constants';
import Alert from '../Alert';
import alertIcon from '../../theme/img/alert_icon.svg';

interface PageHeaderProps {
  title: string;
  layerId: FeatureDataLayerId;
  isPending: boolean;
  isFetching: boolean;
  dataUpdatedAt: number;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, layerId, isPending, isFetching, dataUpdatedAt, children }) => {
  const { t } = useTranslation();
  const alertProps = getAlertProperties(dataUpdatedAt, layerId);

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps?.duration) return t('warnings.viewLastUpdatedUnknown');
    return t('warnings.lastUpdatedAt', { val: alertProps.duration });
  }, [alertProps, t]);

  return (
    <>
      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{title}</strong>
        </h2>
        <em>
          {t('common.modified')} {!isPending && !isFetching && <>{t('common.datetimeFormat', { val: dataUpdatedAt })}</>}
          {(isPending || isFetching) && (
            <IonSkeletonText
              animated={true}
              style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
            />
          )}
        </em>
      </IonText>
      {children}
      {alertProps && !isPending && !isFetching && (
        <Alert icon={alertIcon} color={alertProps.color} className={'top-margin ' + alertProps.color} title={getLayerItemAlertText()} />
      )}
    </>
  );
};

export default PageHeader;

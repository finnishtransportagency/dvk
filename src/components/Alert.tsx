import React, { ReactElement, useEffect } from 'react';
import { IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { useDvkContext } from '../hooks/dvkContext';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Lang } from '../utils/constants';
import { Text } from '../graphql/generated';
import { format, parseISO } from 'date-fns';
import MarkdownParagraph from './content/MarkdownParagraph';
import { setResponseState } from '../utils/common';

interface AlertProps {
  title: string | ReactElement;
  icon: string;
  color?: string;
  className?: string;
  mainLegendOpen?: boolean;
  startDate?: string;
  endDate?: string;
  markdownText?: Text;
  isError?: boolean;
  isFeatures?: boolean;
}

const Alert: React.FC<AlertProps> = ({ title, icon, color, className, startDate, endDate, markdownText }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const getLocaleDateFormat = (date: string) => {
    switch (lang) {
      case 'sv':
        // backend shouldnt return time, but split as a precaution
        return date.split('T')[0];
      case 'en':
        return format(parseISO(date), 'MM/dd/yyyy');
      default:
        return format(parseISO(date), 'dd.MM.yyyy');
    }
  };

  return (
    <IonGrid className={className ?? undefined}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={icon} color={color} />
        </IonCol>
        <IonCol>
          {markdownText ? <MarkdownParagraph markdownText={markdownText} /> : <IonText>{title}</IonText>}
          {startDate && (
            <div style={{ marginTop: '8px' }}>
              <IonText>
                <em className="no-print">
                  {t('inForce')} {getLocaleDateFormat(startDate)} - {endDate && getLocaleDateFormat(endDate)}
                </em>
              </IonText>
            </div>
          )}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LayerAlert: React.FC<AlertProps> = ({ title, icon, color, className, mainLegendOpen, isError, isFeatures }) => {
  const { dispatch } = useDvkContext();

  useEffect(() => {
    if (mainLegendOpen && isError && !isFeatures) {
      setResponseState(dispatch, 503, 'Service Unavailable', t('warnings.layerLoadError'));
    }
  }, [dispatch, mainLegendOpen, isError, isFeatures]);

  return (
    <IonRow>
      <IonCol>
        <IonItem>
          <IonIcon className="icon" size="small" icon={icon} color={color} />
          <IonText className={className ? color + ' ' + className : color}>{title}</IonText>
        </IonItem>
      </IonCol>
    </IonRow>
  );
};

export default Alert;

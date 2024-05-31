import React, { ReactElement, useEffect } from 'react';
import { IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { useDvkContext } from '../hooks/dvkContext';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Lang } from '../utils/constants';
import { format, parseISO } from 'date-fns';

interface AlertProps {
  title: string | ReactElement;
  icon: string;
  color?: string;
  className?: string;
  mainLegendOpen?: boolean;
  startDate?: string;
  endDate?: string;
}

const Alert: React.FC<AlertProps> = (props) => {
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
    <IonGrid className={props.className ? props.className : undefined}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={props.icon} color={props.color} />
        </IonCol>
        <IonCol>
          <IonText>{props.title}</IonText>
          {props.startDate && (
            <div style={{ marginTop: '8px' }}>
              <IonText>
                <em className="no-print">
                  {t('inForce')} {getLocaleDateFormat(props.startDate)} - {props.endDate && getLocaleDateFormat(props.endDate)}
                </em>
              </IonText>
            </div>
          )}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LayerAlert: React.FC<AlertProps> = (props) => {
  const { dispatch } = useDvkContext();

  useEffect(() => {
    if (props.mainLegendOpen) {
      dispatch({
        type: 'setResponse',
        payload: {
          value: [String(503), 'Service Unavailable', t('warnings.layerLoadError')],
        },
      });
    }
  }, [dispatch, props.mainLegendOpen]);

  return (
    <IonRow>
      <IonCol>
        <IonItem>
          <IonIcon className="icon" size="small" icon={props.icon} color={props.color} />
          <IonText className={props.className ? props.color + ' ' + props.className : props.color}>{props.title}</IonText>
        </IonItem>
      </IonCol>
    </IonRow>
  );
};

export default Alert;

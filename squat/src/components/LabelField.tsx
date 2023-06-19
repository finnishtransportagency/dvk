import React, { ReactElement } from 'react';
import { IonIcon, IonItem, IonLabel, IonNote, IonText } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import Label from './Label';
import i18n from '../i18n';

interface LabelProps {
  title: string;
  value: number | string | null;
  unit?: string | ReactElement;
  unitId?: string;
  error?: string;
  helper?: string;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
}

const LabelField: React.FC<LabelProps> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'common' });

  return (
    <>
      <Label title={props.title} infoContentTitle={props.infoContentTitle} infoContent={props.infoContent} />

      <IonItem lines="none" className="item-static">
        <IonText color={props.error ? 'danger' : 'dark'} title={props.error ? props.error : ''} className={props.error ? 'input-error' : ''}>
          {props.error && <IonIcon icon={warningOutline} color="danger" />}
          {props.value}
        </IonText>
        {props.unit && (
          <IonLabel color="medium" className="unit">
            <span
              aria-label={t('unit.' + (props.unitId ? props.unitId : props.unit), {
                count: Number((props.value || 0).toLocaleString(i18n.language)),
              })}
              role="definition"
            >
              &nbsp;{props.unit}
            </span>
          </IonLabel>
        )}
      </IonItem>
      <IonNote className="input-helper">{props.helper}</IonNote>
    </>
  );
};

export default LabelField;

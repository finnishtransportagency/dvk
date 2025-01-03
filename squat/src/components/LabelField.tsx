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
  dataTestid?: string;
}

const LabelField: React.FC<LabelProps> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'common' });

  return (
    <>
      <Label id={`${props.dataTestid}-label`} title={props.title} infoContentTitle={props.infoContentTitle} infoContent={props.infoContent} />

      <IonItem lines="none" className="item-static">
        <IonText
          color={props.error ? 'danger' : 'dark'}
          title={props.error ? props.error : ''}
          className={props.error ? 'input-error' : ''}
          data-testid={props.dataTestid}
        >
          {props.error && <IonIcon icon={warningOutline} color="danger" />}
          {props.value}
        </IonText>
        {props.unit && (
          <IonLabel
            color={props.error ? 'danger' : 'medium'}
            className="unit"
            aria-label={t('unit.' + (props.unitId ? String(props.unitId) : String(props.unit)), {
              count: Number((props.value ?? 0).toLocaleString(i18n.language)),
            })}
          >
            {props.unit === '°' ? props.unit : `\u00A0${String(props.unit)}`}
          </IonLabel>
        )}
      </IonItem>
      <IonNote className="input-helper">{props.helper}</IonNote>
    </>
  );
};

export default LabelField;

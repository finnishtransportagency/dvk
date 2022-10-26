import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';

type HarborPopupContentProps = {
  harbor: HarborProperties;
};

export type HarborFeatureProperties = {
  type: string;
  quay?: Text;
  extraInfo?: Text;
  length?: number;
  name?: Text;
  draft?: number[];
  email?: string;
  phoneNumber?: string[];
  fax?: string;
  internet?: string;
};

export type HarborProperties = {
  coordinates: number[];
  properties: HarborFeatureProperties;
};

const HarborPopupContent: React.FC<HarborPopupContentProps> = ({ harbor }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'popup.harbor' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonGrid id="harborPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">
            {harbor.properties.quay && harbor.properties.quay[lang]}{' '}
            {harbor.properties.name && (harbor.properties.name[lang] || harbor.properties.name.fi)}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {harbor.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(harbor.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('depth')}</IonCol>
        </IonRow>
        {harbor.properties.draft && (
          <IonRow>
            <IonCol>{harbor.properties.draft?.map((d) => t('number', { val: d })).join(' / ')} m</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('length')}</IonCol>
        </IonRow>
        {harbor.properties.length && (
          <IonRow>
            <IonCol>{t('number', { val: harbor.properties.length })} m</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('contactDetails')}</IonCol>
        </IonRow>
        {harbor.properties.email && (
          <IonRow>
            <IonCol>
              {t('email')}: <a href={'mailto:' + harbor.properties.email}>{harbor.properties.email}</a>
            </IonCol>
          </IonRow>
        )}
        {harbor.properties.phoneNumber && (
          <IonRow>
            <IonCol>
              {t('phoneNumber')}: <a href={'tel:' + harbor.properties.phoneNumber[0]}>{harbor.properties.phoneNumber[0]}</a>
            </IonCol>
          </IonRow>
        )}
        {harbor.properties.fax && (
          <IonRow>
            <IonCol>
              {t('fax')}: <a href={'tel:' + harbor.properties.fax}>{harbor.properties.fax}</a>
            </IonCol>
          </IonRow>
        )}
        {harbor.properties.internet && (
          <IonRow>
            <IonCol>
              {t('internet')}:{' '}
              <a href={harbor.properties.internet} target="_blank" rel="noreferrer">
                {harbor.properties.internet}
              </a>
            </IonCol>
          </IonRow>
        )}
        {harbor.properties.extraInfo && harbor.properties.extraInfo[lang] && (
          <>
            <IonRow>
              <IonCol className="header">{t('extra')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{harbor.properties.extraInfo[lang]}</IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonGrid>
  );
};

export default HarborPopupContent;

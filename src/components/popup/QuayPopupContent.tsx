import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { QuayFeatureProperties } from '../features';

type QuayPopupContentProps = {
  quay: QuayProperties;
};

export type QuayProperties = {
  coordinates: number[];
  properties: QuayFeatureProperties;
};

const QuayPopupContent: React.FC<QuayPopupContentProps> = ({ quay }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'popup.harbor' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonGrid id="quayPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">
            {quay.properties.quay && quay.properties.quay[lang]} {quay.properties.name ? quay.properties.name : ''}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {quay.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(quay.coordinates)}</IonCol>
          </IonRow>
        )}
        {quay.properties.draft && (
          <>
            <IonRow>
              <IonCol className="header">{t('depth')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{quay.properties.draft?.map((d) => t('number', { val: d })).join(' / ')} m</IonCol>
            </IonRow>
          </>
        )}
        {quay.properties.length && (
          <>
            <IonRow>
              <IonCol className="header">{t('length')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{t('number', { val: quay.properties.length })} m</IonCol>
            </IonRow>
          </>
        )}
        <IonRow>
          <IonCol className="header">{t('contactDetails')}</IonCol>
        </IonRow>
        {quay.properties.email && (
          <IonRow>
            <IonCol>
              {t('email')}: <a href={'mailto:' + quay.properties.email}>{quay.properties.email}</a>
            </IonCol>
          </IonRow>
        )}
        {quay.properties.phoneNumber && (
          <IonRow>
            <IonCol>
              {t('phoneNumber')}:{' '}
              {quay.properties.phoneNumber.map((p, i) => {
                return (
                  <span key={i}>
                    <a href={'tel:' + p}>{p}</a>
                    <br />
                  </span>
                );
              })}
            </IonCol>
          </IonRow>
        )}
        {quay.properties.fax && (
          <IonRow>
            <IonCol>
              {t('fax')}: <a href={'tel:' + quay.properties.fax}>{quay.properties.fax}</a>
            </IonCol>
          </IonRow>
        )}
        {quay.properties.internet && (
          <IonRow>
            <IonCol>
              {t('internet')}:{' '}
              <a href={quay.properties.internet} target="_blank" rel="noreferrer">
                {quay.properties.internet}
              </a>
            </IonCol>
          </IonRow>
        )}
        {quay.properties.extraInfo && quay.properties.extraInfo[lang] && (
          <>
            <IonRow>
              <IonCol className="header">{t('extra')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{quay.properties.extraInfo[lang]}</IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonGrid>
  );
};

export default QuayPopupContent;

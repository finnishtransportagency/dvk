import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { QuayFeatureProperties } from '../features';
import { Lang } from '../../utils/constants';
import { useDvkContext } from '../../hooks/dvkContext';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import uniqueId from 'lodash/uniqueId';
import CloseButton from './CloseButton';

type QuayPopupContentProps = {
  quay: QuayProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type QuayProperties = {
  coordinates: number[];
  properties: QuayFeatureProperties;
};

const QuayPopupContent: React.FC<QuayPopupContentProps> = ({ quay, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  const quayName = quay.properties.quay?.[lang];
  const sectionName = quay.properties.name ?? '';
  const headerText = quayName && sectionName ? quayName.concat(' - ', sectionName) : (quayName ?? sectionName);

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {headerText}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <em>{quay.properties.n2000HeightSystem ? 'N2000' : 'MW'}</em>
        </IonCol>
      </IonRow>
      {quay.properties.depth && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.quay.depth')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{quay.properties.depth?.map((d) => t('popup.quay.number', { val: d })).join(' / ')} m</IonCol>
          </IonRow>
        </>
      )}
      {quay.properties.length && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.quay.length')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{t('popup.quay.number', { val: quay.properties.length })} m</IonCol>
          </IonRow>
        </>
      )}
      <IonRow>
        <IonCol className="header">{t('popup.quay.contactDetails')}</IonCol>
      </IonRow>
      {quay.properties.email && (
        <IonRow>
          <IonCol>
            {t('popup.quay.email')}: <a href={'mailto:' + quay.properties.email}>{quay.properties.email}</a>
          </IonCol>
        </IonRow>
      )}
      {quay.properties.phoneNumber && (
        <IonRow>
          <IonCol>
            {t('popup.quay.phoneNumber')}:{' '}
            {quay.properties.phoneNumber.map((p) => {
              const uuid = uniqueId('phone_');
              return (
                <span key={uuid}>
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
            {t('popup.quay.fax')}: <a href={'tel:' + quay.properties.fax}>{quay.properties.fax}</a>
          </IonCol>
        </IonRow>
      )}
      {quay.properties.internet && (
        <IonRow>
          <IonCol>
            {t('popup.quay.internet')}:{' '}
            <a href={quay.properties.internet} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
              {quay.properties.internet}
            </a>
          </IonCol>
        </IonRow>
      )}
      {quay.properties.extraInfo?.[lang] && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.quay.extra')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{quay.properties.extraInfo[lang]}</IonCol>
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default QuayPopupContent;

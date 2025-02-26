import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { HarborFeatureProperties } from '../features';
import { Lang } from '../../utils/constants';
import { useDvkContext } from '../../hooks/dvkContext';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { Link } from 'react-router-dom';
import { clearClickSelectionFeatures } from './selectInteraction';
import uniqueId from 'lodash/uniqueId';
import CloseButton from './CloseButton';

type HarborPopupContentProps = {
  harbor: HarborProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type HarborProperties = {
  coordinates: number[];
  properties: HarborFeatureProperties;
};

const HarborPopupContent: React.FC<HarborPopupContentProps> = ({ harbor, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {harbor.properties.name?.[lang]}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <em>{harbor.properties.n2000HeightSystem ? 'N2000' : 'MW'}</em>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.harbor.coordinates')}</IonCol>
      </IonRow>
      {harbor.coordinates && (
        <IonRow>
          <IonCol>{coordinatesToStringHDM(harbor.coordinates)}</IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol className="header">{t('popup.harbor.quays')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{harbor.properties.quays}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.harbor.contactDetails')}</IonCol>
      </IonRow>
      {harbor.properties.email && (
        <IonRow>
          <IonCol>
            {t('popup.harbor.email')}: <a href={'mailto:' + harbor.properties.email}>{harbor.properties.email}</a>
          </IonCol>
        </IonRow>
      )}
      {harbor.properties.phoneNumber && (
        <IonRow>
          <IonCol>
            {t('popup.harbor.phoneNumber')}:{' '}
            {harbor.properties.phoneNumber.map((p) => {
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
      {harbor.properties.fax && (
        <IonRow>
          <IonCol>
            {t('popup.harbor.fax')}: <a href={'tel:' + harbor.properties.fax}>{harbor.properties.fax}</a>
          </IonCol>
        </IonRow>
      )}
      {harbor.properties.internet && (
        <IonRow>
          <IonCol>
            {t('popup.harbor.internet')}:{' '}
            <a href={harbor.properties.internet} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
              {harbor.properties.internet}
            </a>
          </IonCol>
        </IonRow>
      )}
      {harbor.properties.fairwayCards.length > 0 && (
        <IonRow>
          <IonCol className="header">{t('popup.harbor.fairways')}</IonCol>
        </IonRow>
      )}
      {harbor.properties.fairwayCards.map((card) => {
        return (
          <IonRow key={card.id}>
            <IonCol>
              <Link to={`/kortit/${card.id}`} className={state.preview ? 'disableLink' : ''}>
                {card.name[lang]}
              </Link>
            </IonCol>
          </IonRow>
        );
      })}
      {harbor.properties.extraInfo?.[lang] && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.harbor.extra')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{harbor.properties.extraInfo[lang]}</IonCol>
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default HarborPopupContent;

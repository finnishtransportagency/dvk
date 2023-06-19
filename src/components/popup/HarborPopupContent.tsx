import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { HarborFeatureProperties } from '../features';
import { Lang } from '../../utils/constants';
import { useDvkContext } from '../../hooks/dvkContext';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { Link } from 'react-router-dom';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { deselectClickSelection } from './popup';

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
    deselectClickSelection();
  };

  return (
    <IonGrid id="harborPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {harbor.properties.name && harbor.properties.name[lang]}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
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
              {harbor.properties.phoneNumber.map((p, i) => {
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
        <IonRow>
          <IonCol className="header">{t('popup.harbor.fairways')}</IonCol>
        </IonRow>
        {harbor.properties.fairwayCards.map((card) => {
          return (
            <IonRow key={card.id}>
              <IonCol>
                <Link to={`/kortit/${card.id}`}>{card.name[lang]}</Link>
              </IonCol>
            </IonRow>
          );
        })}
        {harbor.properties.extraInfo && harbor.properties.extraInfo[lang] && (
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
    </IonGrid>
  );
};

export default HarborPopupContent;

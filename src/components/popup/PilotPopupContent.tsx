import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { Link } from 'react-router-dom';
import { PilotFeatureProperties } from '../features';
import { Lang } from '../../utils/constants';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';
import { deselectFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useDvkContext } from '../../hooks/dvkContext';

type PilotPopupContentProps = {
  pilot: PilotProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type PilotProperties = {
  coordinates: number[];
  properties: PilotFeatureProperties;
};

const PilotPopupContent: React.FC<PilotPopupContentProps> = ({ pilot, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {t('popup.pilotPlace.header', { val: pilot?.properties.name[lang] })}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.pilotPlace.coordinates')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{coordinatesToStringHDM(pilot?.coordinates) || <InfoParagraph title={t('common.noData')} />}</IonCol>
      </IonRow>
      {pilot.properties.fairwayCards && pilot.properties.fairwayCards.length > 0 && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.pilotPlace.fairways')}</IonCol>
          </IonRow>
          {pilot.properties.fairwayCards.map((card) => {
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
        </>
      )}
    </IonGrid>
  );
};

export default PilotPopupContent;

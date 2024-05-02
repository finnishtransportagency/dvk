import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { EquipmentFeatureProperties } from '../features';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useDvkContext } from '../../hooks/dvkContext';
import InfoIcon from '../../theme/img/info.svg?react';

type EquipmentPopupContentProps = {
  equipment: EquipmentProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type EquipmentProperties = {
  coordinates: number[];
  properties: EquipmentFeatureProperties;
};

const EquipmentPopupContent: React.FC<EquipmentPopupContentProps> = ({ equipment, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const fairwayCards = equipment.properties.fairwayCards ?? [];

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {equipment.properties.name && (equipment.properties.name[lang] || equipment.properties.name.fi)}
          {' - '}
          {equipment.properties.id}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      {equipment.properties.faults && (
        <IonGrid className="faultGrid">
          {equipment.properties.faults.map((fault) => {
            return (
              <div key={fault.faultId}>
                <IonRow>
                  <IonCol>
                    <strong>{t('popup.equipment.fault')}</strong>
                    &nbsp;
                    {t('popup.equipment.datetime', {
                      val: fault.recordTime,
                    })}
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>{fault.faultType[lang] ?? fault.faultType.fi}</IonCol>
                </IonRow>
              </div>
            );
          })}
        </IonGrid>
      )}
      <IonRow>
        <IonCol className="header">{t('popup.equipment.coordinates')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{coordinatesToStringHDM(equipment.coordinates)}</IonCol>
      </IonRow>
      {equipment.properties.typeName && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.equipment.type')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              {equipment.properties.typeName[lang] ?? equipment.properties.typeName.fi}
              {equipment.properties.aisType !== undefined && equipment.properties.aisType !== 1
                ? `${', ' + t('popup.equipment.type' + equipment.properties.aisType)}`
                : ''}
            </IonCol>
          </IonRow>
        </>
      )}
      {equipment.properties.lightning && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.equipment.lightning')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{equipment.properties.lightning ? t('popup.equipment.yes') : t('popup.equipment.no')}</IonCol>
          </IonRow>
        </>
      )}
      {equipment.properties.navigation && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.equipment.navigationCode')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{equipment.properties.navigation[lang] ?? equipment.properties.navigation.fi}</IonCol>
          </IonRow>
        </>
      )}
      {equipment.properties.distances && equipment.properties.distances.length > 0 && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.equipment.distances', { count: equipment.properties.distances.length })}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              {equipment.properties.distances.map((d, idx) => {
                return (
                  <span key={d.areaId}>
                    {d.distance}
                    {idx < (equipment.properties.distances?.length || 0) - 1 ? 'm, ' : 'm'}
                  </span>
                );
              })}
            </IonCol>
          </IonRow>
        </>
      )}
      <IonRow>
        <IonCol className="header">{t('popup.equipment.fairways')}</IonCol>
      </IonRow>
      {fairwayCards.length > 0 ? (
        fairwayCards.map((card) => {
          return (
            <IonRow key={card.id}>
              <IonCol>
                <Link to={`/kortit/${card.id}`} className={state.preview ? 'disableLink' : ''}>
                  {card.name[lang]}
                </Link>
              </IonCol>
            </IonRow>
          );
        })
      ) : (
        <IonRow>
          <IonCol>
            <p className="info use-flex ion-align-items-center">
              <InfoIcon />
              {t('popup.common.noFairwayCards')}
            </p>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
};

export default EquipmentPopupContent;

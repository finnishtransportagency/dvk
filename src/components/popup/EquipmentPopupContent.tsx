import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { EquipmentFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { deselectClickSelection } from './popup';

type EquipmentPopupContentProps = {
  equipment: EquipmentProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type EquipmentProperties = {
  coordinates: number[];
  properties: EquipmentFeatureProperties;
};

type FairwayCardIdName = {
  id: string;
  name: Text;
};

const EquipmentPopupContent: React.FC<EquipmentPopupContentProps> = ({ equipment, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  let fairwayCards: FairwayCardIdName[] = [];
  equipment.properties?.fairways?.forEach((f) => {
    if (f.fairwayCards) {
      fairwayCards.push(...f.fairwayCards);
    }
  });
  fairwayCards = [...new Map(fairwayCards.map((item) => [item.id, item])).values()];

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };

  return (
    <IonGrid id="equipmentPopupContent" className="ion-padding">
      <IonGrid className="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {equipment.properties.name && (equipment.properties.name[lang] || equipment.properties.name.fi)}
            {' - '}
            {equipment.properties.id}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
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
                    <IonCol>{fault.faultType[lang] || fault.faultType.fi}</IonCol>
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
                {equipment.properties.typeName[lang] || equipment.properties.typeName.fi}
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
              <IonCol>{equipment.properties.navigation[lang] || equipment.properties.navigation.fi}</IonCol>
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
        {fairwayCards.length > 0 && (
          <IonRow>
            <IonCol className="header">{t('popup.equipment.fairways')}</IonCol>
          </IonRow>
        )}
        {fairwayCards.map((card) => {
          return (
            <IonRow key={card.id}>
              <IonCol>
                <Link to={`/kortit/${card.id}`}>{card.name[lang]}</Link>
              </IonCol>
            </IonRow>
          );
        })}
      </IonGrid>
    </IonGrid>
  );
};

export default EquipmentPopupContent;

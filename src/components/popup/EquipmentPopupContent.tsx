import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { EquipmentFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';

type EquipmentPopupContentProps = {
  equipment: EquipmentProperties;
};

export type EquipmentProperties = {
  coordinates: number[];
  properties: EquipmentFeatureProperties;
};

type FairwayCardIdName = {
  id: string;
  name: Text;
};

const EquipmentPopupContent: React.FC<EquipmentPopupContentProps> = ({ equipment }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  let fairwayCards: FairwayCardIdName[] = [];
  equipment.properties?.fairways?.forEach((f) => {
    if (f.fairwayCards) {
      fairwayCards.push(...f.fairwayCards);
    }
  });
  fairwayCards = [...new Map(fairwayCards.map((item) => [item.id, item])).values()];
  return (
    <IonGrid id="equipmentPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        {equipment.properties.name && (
          <IonRow>
            <IonCol className="header">
              {equipment.properties.name[lang] || equipment.properties.name.fi}
              {' - '}
              {equipment.properties.id}
            </IonCol>
          </IonRow>
        )}
        {equipment.properties.faults && (
          <IonGrid class="faultGrid">
            {equipment.properties.faults.map((fault, index) => {
              return (
                <div key={index}>
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
                {equipment.properties.subType && equipment.properties.aisType === 1 ? `${', ' + equipment.properties.subType.toLowerCase()}` : ''}
                {equipment.properties.aisType !== 1 ? `${', ' + t('popup.equipment.type' + equipment.properties.aisType)}` : ''}
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
        {fairwayCards.length > 0 && (
          <IonRow>
            <IonCol className="header">{t('popup.equipment.fairways')}</IonCol>
          </IonRow>
        )}
        {fairwayCards?.map((card, index) => {
          return (
            <IonRow key={index}>
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

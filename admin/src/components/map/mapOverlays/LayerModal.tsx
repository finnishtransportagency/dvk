import React, { useEffect, useState } from 'react';
import { IonCol, IonRow, IonGrid, IonList, IonModal, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getMap } from '../DvkMap';
import './LayerModal.css';
import { FeatureDataLayerId, FeatureDataMainLayerId, MAP } from '../../../utils/constants';
import LayerItem from './LayerItem';
import closeIcon from '../../../theme/img/close_black_24dp.svg';
import { Maybe } from '../../../graphql/generated';
import LayerMainItem from './LayerMainItem';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export type LayerType = {
  id: FeatureDataLayerId | FeatureDataMainLayerId;
  title: string;
  childLayers?: Maybe<Array<LayerType>>;
  noOfflineSupport?: Maybe<boolean>;
};

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const [layers, setLayers] = useState<string[]>(['pilot', 'line12', 'harbor', 'name']);
  const dvkMap = getMap();

  const layerStructure: LayerType[] = [
    {
      id: 'merchant',
      title: t('homePage.map.controls.layer.class1'),
      childLayers: [
        { id: 'area12', title: t('homePage.map.controls.layer.fairwayAreas') },
        { id: 'line12', title: t('homePage.map.controls.layer.lines') },
        { id: 'boardline12', title: t('homePage.map.controls.layer.boardLines') },
        { id: 'circle', title: t('homePage.map.controls.layer.circles') },
      ],
    },
    {
      id: 'othertraffic',
      title: t('homePage.map.controls.layer.class2'),
      childLayers: [
        { id: 'area3456', title: t('homePage.map.controls.layer.fairwayAreas') },
        { id: 'line3456', title: t('homePage.map.controls.layer.lines') },
      ],
    },
    { id: 'speedlimit', title: t('homePage.map.controls.layer.speedLimits') },
    {
      id: 'specialarea',
      title: t('homePage.map.controls.layer.specialAreas'),
      childLayers: [
        { id: 'specialarea2', title: t('homePage.map.controls.layer.specialarea2') },
        { id: 'specialarea15', title: t('homePage.map.controls.layer.specialarea15') },
      ],
    },
    { id: 'depth12', title: t('homePage.map.controls.layer.depths') },
    { id: 'safetyequipment', title: t('homePage.map.controls.layer.safetyEquipments') },
    {
      id: 'vts',
      title: t('homePage.map.controls.layer.vts'),
      childLayers: [
        { id: 'vtsline', title: t('homePage.map.controls.layer.vtsline') },
        { id: 'vtspoint', title: t('homePage.map.controls.layer.vtspoint') },
      ],
    },
    { id: 'pilot', title: t('homePage.map.controls.layer.pilotPlaces') },
    { id: 'name', title: t('homePage.map.controls.layer.name') },
  ];

  useEffect(() => {
    MAP.FEATURE_DATA_LAYERS.forEach((dataLayer) => {
      const layer = dvkMap.getFeatureLayer(dataLayer.id);
      layer.setVisible(layers.includes(dataLayer.id));
    });
  }, [layers, dvkMap]);

  return (
    <IonModal
      id="layerModalContainer"
      isOpen={isOpen}
      onDidDismiss={() => {
        setIsOpen(false);
      }}
    >
      <IonList id="layerModalContent" lines="none" className="ion-no-padding" aria-labelledby="layerlist-label">
        <IonGrid className="mainGrid">
          <IonRow className="section ion-align-items-center">
            <IonCol>
              <IonText id="layerlist-label">
                <h6>{t('homePage.map.controls.layer.header')}</h6>
              </IonText>
            </IonCol>
            <IonCol size="auto">
              <IonButton
                fill="clear"
                className="closeButton"
                onClick={() => setIsOpen(false)}
                data-testid="closeMenu"
                title={t('common.close') || ''}
                aria-label={t('common.close') || ''}
              >
                <IonIcon className="otherIconLarge" src={closeIcon} />
              </IonButton>
            </IonCol>
          </IonRow>
          {layerStructure.map((layer) => (
            <IonRow key={layer.id}>
              <IonCol>
                {layer.childLayers && layer.childLayers.length > 0 && <LayerMainItem currentLayer={layer} layers={layers} setLayers={setLayers} />}
                {!layer.childLayers && (
                  <LayerItem
                    id={layer.id as FeatureDataLayerId}
                    title={layer.title}
                    noOfflineSupport={layer.noOfflineSupport || false}
                    layers={layers}
                    setLayers={setLayers}
                  />
                )}
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>
      </IonList>
    </IonModal>
  );
};

export default LayerModal;
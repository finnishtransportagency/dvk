import React from 'react';
import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import './popup.css';
import { PilotRouteFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';

type PilotRoutePopupContentProps = {
  pilotroute: PilotRouteProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type PilotRouteProperties = {
  properties: PilotRouteFeatureProperties;
};

export const RtzFileDownload: React.FC<PilotRouteProperties> = ({ properties }) => {
  const fileName = `${properties.name}.rtz`;

  const downloadFile = () => {
    const blob = new Blob([properties.rtz], { type: 'text/xml' });
    saveAs(blob, fileName);
  };

  return (
    <IonText className="fileDownload" onClick={() => downloadFile()}>
      {fileName}
    </IonText>
  );
};

const PilotRoutePopupContent: React.FC<PilotRoutePopupContentProps> = ({ pilotroute, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {t('popup.pilotRoute.header', { val: pilotroute.properties.name })}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      {pilotroute.properties.rtz && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.pilotRoute.rtz')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <RtzFileDownload properties={pilotroute.properties} />
            </IonCol>
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default PilotRoutePopupContent;

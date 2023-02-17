import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import dvkMap from '../components/DvkMap';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { useDvkContext } from '../hooks/dvkContext';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
}

const HomePage: React.FC<ModalProps> = ({ setModalContent }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const mapElement = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  const title = t('documentTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);

  const { dispatch } = useDvkContext();

  useEffect(() => {
    setModalContent('');
  }, [setModalContent]);

  useEffect(() => {
    dispatch({
      type: 'setBreakpoint',
      payload: {
        value: 0.5,
      },
    });
  }, [dispatch]);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addShowSidebarMenuControl();
      dvkMap.addSearchbarControl();
      dvkMap.addLayerPopupControl();
      dvkMap.addCenterToOwnLocationControl();
      dvkMap.addZoomControl();
      dvkMap.addRotationControl();
      dvkMap.setTarget(mapElement.current);
      dvkMap.setHistory(history);
    }
  });

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div className="mainMapWrapper" ref={mapElement} data-testid="homeMap"></div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;

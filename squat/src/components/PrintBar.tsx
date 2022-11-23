import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonRow, IonTextarea, IonToast } from '@ionic/react';
import { checkmarkCircleOutline, clipboardOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { copyToClipboard, createShareableLink } from '../utils/helpers';

import Modal from './Modal';

const PrintBar: React.FC = () => {
  const { state } = useSquatContext();
  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);
  const { t } = useTranslation('', { keyPrefix: 'homePage' });

  const handleCopyClick = () => {
    copyToClipboard(createShareableLink(state, true));
    setShowCopyToast(true);
  };
  return (
    <>
      <IonGrid>
        <IonRow>
          <IonCol class="ion-align-self-center" size="auto">
            <Modal
              title={t('header.shareable-link-title')}
              content={
                <>
                  <p>{t('header.shareable-link-body')}</p>
                  <IonItem lines="none">
                    <IonItem fill="outline">
                      <IonTextarea value={createShareableLink(state, true)} autoGrow readonly className="small-text" />
                    </IonItem>
                    <IonButton
                      fill="clear"
                      className="icon-only"
                      onClick={() => handleCopyClick()}
                      id="hover-trigger_"
                      title={t('header.copy-to-clipboard')}
                      slot="end"
                    >
                      <IonIcon color="primary" slot="icon-only" src={clipboardOutline} />
                    </IonButton>
                  </IonItem>
                  <IonToast
                    isOpen={showCopyToast}
                    onDidDismiss={() => setShowCopyToast(false)}
                    message={t('header.copied-to-clipboard')}
                    duration={2000}
                    position="middle"
                    icon={checkmarkCircleOutline}
                  />
                </>
              }
              trigger={<IonIcon src="assets/share_icon.svg" size="large" />}
              triggerTitle={t('header.shareable-link-title')}
            />
          </IonCol>
          <IonCol class="ion-align-self-center" size="auto">
            <IonButton
              fill="clear"
              className="icon-only"
              onClick={() => window.print()}
              title={t('header.print')}
              aria-label={t('header.print')}
              role="button"
            >
              <IonIcon color="primary" slot="icon-only" src="assets/print_icon.svg" size="large" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default PrintBar;

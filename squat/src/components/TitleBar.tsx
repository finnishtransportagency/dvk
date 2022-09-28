import React, { useState } from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText, IonTextarea, IonToast } from '@ionic/react';
import { checkmarkCircleOutline, clipboardOutline, printOutline, shareSocialOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { copyToClipboard, createShareableLink } from '../utils/helpers';
import { useSquatContext } from '../hooks/squatContext';

const TitleBar: React.FC = () => {
  const { t } = useTranslation('', { keyPrefix: 'homePage' });
  const { state } = useSquatContext();

  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);

  const handleCopyClick = () => {
    copyToClipboard(createShareableLink(state, true));
    setShowCopyToast(true);
  };

  return (
    <IonGrid className="titlebar">
      <IonRow>
        <IonCol>
          <IonText color="dark" className="equal-margin-top">
            <h1>
              <strong>{t('squat.content')}</strong>
            </h1>
          </IonText>
        </IonCol>
        <IonCol size="auto" className="ion-align-self-center">
          <IonGrid>
            <IonRow>
              <IonCol>
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
                          <IonIcon color="primary" slot="icon-only" icon={clipboardOutline} />
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
                  trigger={<IonIcon icon={shareSocialOutline} size="large" />}
                  triggerTitle={t('header.shareable-link-title')}
                />
              </IonCol>
              {/*<IonCol>
                <IonIcon icon={downloadOutline} color="medium" size="large" />
              </IonCol>
              <IonCol>
                <IonIcon icon={downloadOutline} color="medium" size="large" className="flipped" />
                </IonCol>*/}
              <IonCol>
                <IonButton
                  fill="clear"
                  className="icon-only"
                  onClick={() => window.print()}
                  title={t('header.print')}
                  aria-label={t('header.print')}
                  role="button"
                >
                  <IonIcon color="primary" slot="icon-only" icon={printOutline} size="large" />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TitleBar;

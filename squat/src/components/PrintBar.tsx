import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonRow, IonTextarea, IonToast } from '@ionic/react';
import { checkmarkCircleOutline, clipboardOutline } from 'ionicons/icons';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { copyToClipboard, createShareableLink } from '../utils/helpers';

import Modal from './Modal';

const PrintBar: React.FC = () => {
  const { state } = useSquatContext();
  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);
  const { t } = useTranslation('', { keyPrefix: 'homePage' });

  const handleCopyClick = useCallback(() => {
    copyToClipboard(createShareableLink(state, true));
    setShowCopyToast(true);
  }, [state]);

  const handlePrintClick = useCallback(() => {
    window.print();
  }, []);

  const handleToastDismiss = useCallback(() => {
    setShowCopyToast(false);
  }, []);

  return (
    <>
      <IonGrid>
        <IonRow>
          <IonCol class="ion-align-self-center" size="auto" style={{ paddingRight: '16px' }}>
            <Modal
              title={t('header.shareable-link-title')}
              content={
                <>
                  <p>{t('header.shareable-link-body')}</p>
                  <IonItem lines="none" className="readonly-wrapper">
                    <IonTextarea value={createShareableLink(state, true)} autoGrow readonly rows={1} className="small-text" fill="outline" />
                    <IonButton
                      fill="clear"
                      className="icon-only large"
                      onClick={handleCopyClick}
                      id="hover-trigger_"
                      title={t('header.copy-to-clipboard')}
                      slot="end"
                    >
                      <IonIcon color="primary" slot="icon-only" src={clipboardOutline} />
                    </IonButton>
                  </IonItem>
                  <IonToast
                    isOpen={showCopyToast}
                    onDidDismiss={handleToastDismiss}
                    message={t('header.copied-to-clipboard')}
                    duration={2000}
                    position="middle"
                    icon={checkmarkCircleOutline}
                  />
                </>
              }
              trigger={<IonIcon src="assets/share_icon.svg" size="medium" />}
              triggerTitle={t('header.shareable-link-title')}
              triggerClassName="large"
              handleDismiss={handleToastDismiss}
            />
          </IonCol>
          <IonCol class="ion-align-self-center" size="auto">
            <IonButton
              fill="clear"
              className="icon-only large no-background-focused"
              onClick={handlePrintClick}
              title={t('header.print')}
              aria-label={t('header.print')}
              role="button"
            >
              <IonIcon color="primary" slot="icon-only" src="assets/print_icon.svg" size="medium" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default PrintBar;

import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonRow, IonTextarea, IonToast } from '@ionic/react';
import { checkmarkCircleOutline, clipboardOutline } from 'ionicons/icons';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { copyToClipboard, createShareableLink } from '../utils/helpers';
import shareIcon from '../theme/img/share_icon.svg';
import printIcon from '../theme/img/print_icon.svg';

import Modal from './Modal';

const PrintBar: React.FC = () => {
  const { state } = useSquatContext();
  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);
  const { t } = useTranslation('', { keyPrefix: 'homePage' });
  const { embeddedSquat } = state;

  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const selectText = useCallback(() => {
    inputRef.current
      ?.getInputElement()
      .then((textarea) => (textarea ? textarea.select() : null))
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  const handleCopyClick = useCallback(() => {
    copyToClipboard(createShareableLink(state, true));
    selectText();
    setShowCopyToast(true);
  }, [state, selectText]);

  const handlePrintClick = useCallback(() => {
    window.print();
  }, []);

  const handleToastDismiss = useCallback(() => {
    setShowCopyToast(false);
  }, []);

  return (
    <IonGrid className={embeddedSquat ? 'ion-no-padding' : ''}>
      <IonRow>
        <IonCol className="ion-align-self-center" size="auto" style={{ paddingRight: '16px' }}>
          <Modal
            title={t('header.shareable-link-title')}
            content={
              <>
                <p>{t('header.shareable-link-body')}</p>
                <IonItem lines="none" className="readonly-wrapper">
                  <IonTextarea
                    value={createShareableLink(state, true)}
                    autoGrow
                    readonly
                    rows={1}
                    onIonFocus={selectText}
                    className="small-text"
                    fill="outline"
                    ref={inputRef}
                  />
                  <IonButton
                    fill="clear"
                    className="icon-only large no-background-focused"
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
            triggerIcon={
              <IonIcon aria-label={t('header.shareable-link-title')} src={shareIcon} size={embeddedSquat ? 'small' : 'medium'} slot="icon-only" />
            }
            triggerTitle={t('header.shareable-link-title')}
            triggerClassName={embeddedSquat ? 'small no-print' : 'large no-background-focused'}
            handleDismiss={handleToastDismiss}
          />
        </IonCol>
        <IonCol className="ion-align-self-center" size="auto">
          <IonButton
            fill="clear"
            className={'icon-only ' + (embeddedSquat ? 'small no-print' : 'large no-background-focused')}
            onClick={handlePrintClick}
            title={t('header.print')}
            aria-label={t('header.print')}
          >
            <IonIcon aria-label={t('header.print')} color="primary" src={printIcon} size={embeddedSquat ? 'small' : 'medium'} slot="icon-only" />
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default PrintBar;

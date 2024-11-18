import {
  IonButton,
  IonButtons,
  IonCol,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRange,
  IonRow,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import './CommonModal.css';
import closeIcon from '../../theme/img/close_black_24dp.svg';

type ModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  showBackdrop: boolean;
  size: string;
  children: ReactElement;
  htmlId?: string;
  handleSubmit?: () => void;
};

export const CommonModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, title, showBackdrop, size, children, htmlId, handleSubmit }) => {
  const { t } = useTranslation();
  return (
    <IonModal id={htmlId ?? 'commonModal'} isOpen={isOpen} className={size} showBackdrop={showBackdrop} onDidDismiss={() => setIsOpen(false)}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{title}</div>
          </IonTitle>
          <IonButtons slot="end" style={{ marginRight: '16px' }}>
            <IonButton
              onClick={() => setIsOpen(false)}
              fill="clear"
              className="closeButton"
              title={t('common.close-dialog')}
              aria-label={t('common.close-dialog')}
            >
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {children}
      <IonFooter>
        <IonToolbar className="buttonBar ion-margin-top">
          {handleSubmit && (
            <IonButton
              slot="end"
              onClick={() => {
                handleSubmit();
                setIsOpen(false);
              }}
              shape="round"
            >
              {t('common.submit')}
            </IonButton>
          )}
          <IonButton slot="end" onClick={() => setIsOpen(false)} shape="round">
            {t('common.close')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

type SourceModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const SourceModal: React.FC<SourceModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  return (
    <CommonModal size="large" showBackdrop={false} isOpen={isOpen} setIsOpen={setIsOpen} title={t('source.title')}>
      <IonGrid className="linkBar content">
        <IonRow>
          <IonCol> {t('source.content1')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol> {t('source.content2')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <a href="https://creativecommons.org/licenses/by/4.0/deed.fi" rel="noreferrer" target="_blank" className="ion-no-padding external">
              {'https://creativecommons.org/licenses/by/4.0/deed.fi'}
              <span className="screen-reader-only">{t('common.opens-in-a-new-tab')}</span>
            </a>{' '}
            {t('source.content3')}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {t('source.content4')}
            {' | '}
            <a href="https://www.maanmittauslaitos.fi/avoindata-lisenssi-cc40" rel="noreferrer" target="_blank" className="ion-no-padding external">
              {t('source.content5')}
              <span className="screen-reader-only">{t('common.opens-in-a-new-tab')}</span>
            </a>
          </IonCol>
        </IonRow>
      </IonGrid>
    </CommonModal>
  );
};

type FeedbackModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleSubmit: () => void;
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, setIsOpen, handleSubmit }) => {
  const { t } = useTranslation();
  return (
    <CommonModal
      size="large"
      showBackdrop={false}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={t('feedback.title')}
      // TODO: pass down the handler
      handleSubmit={handleSubmit}
    >
      <IonGrid className="linkBar content">
        <IonRow>
          <IonCol>{t('feedback.content')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <strong>{t('feedback.title2')}</strong>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('feedback.content2')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonRange aria-label="Arvosana-asteikko" min={0} max={10} value={5} pin={true} ticks={true} snaps={true}></IonRange>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <strong>{t('feedback.title3')}</strong>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonTextarea fill="outline" autoGrow></IonTextarea>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('feedback.content3')}</IonCol>
        </IonRow>
      </IonGrid>
    </CommonModal>
  );
};

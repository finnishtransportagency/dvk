import { IonButton, IonItem, IonText } from '@ionic/react';
import React, { useState } from 'react';
import ChevronIcon from '../../theme/img/chevron.svg?react';
import HelpIcon from '../../theme/img/help_icon.svg?react';
import { useTranslation } from 'react-i18next';
import NotificationModal from '../NotificationModal';

interface WrapperComponentProps {
  title: string;
  children: React.ReactNode;
  notificationHeader?: string;
  notificationI18nKey?: string;
  notificationMessage?: string;
}

const WrapperComponent: React.FC<WrapperComponentProps> = ({ title, children, notificationHeader, notificationI18nKey, notificationMessage }) => {
  const { t } = useTranslation();

  const [sectionOpen, setSectionOpen] = useState<boolean>(true);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(true);

  const sectionClassName = 'sectionContent' + (sectionOpen ? ' open' : ' closed');

  return (
    <>
      <IonItem className="sectionHeader">
        <IonText>
          <h2>
            {title}
            {notificationHeader && notificationMessage && (
              <IonButton
                fill="clear"
                className="icon-only xx-small labelButton"
                onClick={() => setInfoModalOpen(!infoModalOpen)}
                title={t('info')}
                aria-label={t('info')}
              >
                <HelpIcon />
              </IonButton>
            )}
          </h2>
        </IonText>
        <IonButton
          slot="end"
          fill="clear"
          className={'icon-only small toggle ' + (sectionOpen ? 'open' : 'closed')}
          onClick={() => setSectionOpen(!sectionOpen)}
        >
          <ChevronIcon />
        </IonButton>
      </IonItem>
      <div className={sectionClassName}>
        <div>{children}</div>
      </div>
      {notificationHeader && notificationMessage && (
        <NotificationModal
          isOpen={infoModalOpen}
          closeAction={() => setInfoModalOpen(false)}
          closeTitle={t('general.close')}
          header={notificationHeader}
          i18nkey={notificationI18nKey}
          message={notificationMessage}
        />
      )}
    </>
  );
};

export default WrapperComponent;

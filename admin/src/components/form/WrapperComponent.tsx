import { IonButton, IonItem, IonRow, IonText } from '@ionic/react';
import React, { useState } from 'react';
import ChevronIcon from '../../theme/img/chevron.svg?react';
import HelpIcon from '../../theme/img/help_icon.svg?react';
import { useTranslation } from 'react-i18next';
import NotificationModal from '../NotificationModal';

interface WrapperComponentProps {
  title: string;
  children: React.ReactNode;
  infoHeader?: string;
  infoI18nKey?: string;
  infoMessage?: string;
  dataTestId?: string;
  titleDataTestId?: string;
  subSection?: boolean;
}

const WrapperComponent: React.FC<WrapperComponentProps> = ({
  title,
  children,
  infoHeader,
  infoI18nKey,
  infoMessage,
  dataTestId,
  titleDataTestId,
  subSection,
}) => {
  const { t } = useTranslation();

  const [sectionOpen, setSectionOpen] = useState<boolean>(true);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const sectionClassName = 'sectionContent' + (sectionOpen ? ' open' : ' closed');

  // pilot order header has style exception
  const isPilotOrder = title.includes('Luotsintilaus');

  return (
    <>
      <IonItem className="sectionHeader" style={isPilotOrder ? { margin: '0px' } : {}}>
        <IonText className="ion-no-padding">
          {/* This row is to keep header and button in same level */}
          <IonRow className="ion-no-padding">
            {subSection ? <h3 data-testid={titleDataTestId}>{title}</h3> : <h2 data-testid={titleDataTestId}>{title}</h2>}
            {infoHeader && infoMessage && (
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
          </IonRow>
        </IonText>
        <IonButton
          data-testid={dataTestId}
          slot="end"
          fill="clear"
          className={'icon-only small toggle ' + (sectionOpen ? 'open' : 'closed')}
          onClick={() => setSectionOpen(!sectionOpen)}
          title={sectionOpen ? t('general.close') : t('general.open')}
          aria-label={sectionOpen ? t('general.close') : t('general.open')}
        >
          <ChevronIcon />
        </IonButton>
      </IonItem>
      <div className={sectionClassName}>
        <div>{children}</div>
      </div>
      {infoHeader && infoMessage && (
        <NotificationModal
          isOpen={infoModalOpen}
          closeAction={() => setInfoModalOpen(false)}
          closeTitle={t('general.close')}
          header={infoHeader}
          i18nkey={infoI18nKey}
          message={infoMessage}
        />
      )}
    </>
  );
};

export default WrapperComponent;

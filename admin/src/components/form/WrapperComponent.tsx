import { IonButton, IonItem, IonRow, IonText } from '@ionic/react';
import React, { useState } from 'react';
import ChevronIcon from '../../theme/img/chevron.svg?react';
import HelpIcon from '../../theme/img/help_icon.svg?react';
import { useTranslation } from 'react-i18next';
import NotificationModal from '../NotificationModal';
import { MainSectionTitle, MainSectionType } from '../../utils/constants';

interface WrapperComponentProps {
  title: string;
  children: React.ReactNode;
  sectionsOpen: MainSectionType[];
  toggleSection: (id: MainSectionTitle, open: boolean) => void;
  infoHeader?: string;
  infoI18nKey?: string;
  infoMessage?: string;
  dataTestId?: string;
  titleDataTestId?: string;
  subSection?: boolean;
  disabled?: boolean;
}

const WrapperComponent: React.FC<WrapperComponentProps> = ({
  title,
  children,
  toggleSection,
  sectionsOpen,
  infoHeader,
  infoI18nKey,
  infoMessage,
  dataTestId,
  titleDataTestId,
  subSection,
  disabled,
}) => {
  const { t } = useTranslation();
  // !disabled because if there's no content, no need to section be open
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const open = !disabled && sectionsOpen.find((s) => s.id === title)?.open;
  const sectionClassName = 'sectionContent' + (open ? ' open' : ' closed');

  // pilot order header has style exception
  const isPilotOrder = title.includes('Luotsintilaus');

  return (
    <>
      <IonItem className="sectionHeader" style={isPilotOrder ? { margin: '0px' } : {}}>
        <IonText className="ion-no-padding">
          {/* This row is to keep header and button in same level */}
          <IonRow className="ion-no-padding align-items">
            {subSection ? (
              <h3 data-testid={titleDataTestId} className={disabled ? 'disabled' : ''}>
                {title}
              </h3>
            ) : (
              <h2 data-testid={titleDataTestId} className={disabled ? 'disabled' : ''}>
                {title}
              </h2>
            )}
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
          className={'icon-only small toggle' + (open ? ' close' : ' open')}
          onClick={() => toggleSection(title as MainSectionTitle, !open)}
          title={open ? t('general.close') : t('general.open')}
          aria-label={open ? t('general.close') : t('general.open')}
          disabled={disabled}
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

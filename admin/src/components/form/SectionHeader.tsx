import React, { useState } from 'react';
import { IonButton, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import ChevronIcon from '../../theme/img/chevron.svg?react';
import BinIcon from '../../theme/img/bin.svg?react';
import HelpIcon from '../../theme/img/help_icon.svg?react';
import NotificationModal from '../NotificationModal';

interface SectionHeaderProps {
  title: string;
  idx: number;
  deleteSection: (idx: number) => void;
  toggleSection: (position: number) => void;
  open: boolean;
  disabled?: boolean;
  readonly?: boolean;
  infoTitle?: string;
  infoDescription?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  idx,
  deleteSection,
  toggleSection,
  open,
  disabled,
  readonly = false,
  infoTitle,
  infoDescription,
}) => {
  const { t } = useTranslation();
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  return (
    <>
      <IonItem className="sectionHeader">
        <IonText>
          <h3>
            {title} {idx + 1}
          </h3>
        </IonText>
        {infoTitle && infoDescription && (
          <IonButton
            slot="end"
            fill="clear"
            className="icon-only small"
            onClick={() => showInfoModal()}
            title={t('general.info') ?? ''}
            aria-label={t('general.info') ?? ''}
          >
            <HelpIcon />
          </IonButton>
        )}
        <IonButton
          slot="end"
          fill="clear"
          className="icon-only small"
          onClick={() => deleteSection(idx)}
          title={t('general.delete') ?? ''}
          aria-label={t('general.delete') ?? ''}
          disabled={readonly || disabled}
        >
          <BinIcon />
        </IonButton>
        <IonButton
          slot="end"
          fill="clear"
          className={'icon-only small toggle' + (open ? ' close' : ' open')}
          onClick={() => toggleSection(idx)}
          title={(open ? t('general.close') : t('general.open')) ?? ''}
          aria-label={(open ? t('general.close') : t('general.open')) ?? ''}
        >
          <ChevronIcon />
        </IonButton>
      </IonItem>
      <NotificationModal
        isOpen={infoModalOpen}
        closeAction={() => setInfoModalOpen(false)}
        closeTitle={t('general.close')}
        header={infoTitle ?? ''}
        message={infoDescription ?? ''}
      />
    </>
  );
};

export default SectionHeader;

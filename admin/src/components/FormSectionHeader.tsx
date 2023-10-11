import React from 'react';
import { IonButton, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import ChevronIcon from '../theme/img/chevron.svg?react';
import BinIcon from '../theme/img/bin.svg?react';

interface FormSectionHeaderProps {
  title: string;
  idx: number;
  deleteSection: (idx: number) => void;
  toggleSection: (position: number) => void;
  open: boolean;
  disabled?: boolean;
}

const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({ title, idx, deleteSection, toggleSection, open, disabled }) => {
  const { t } = useTranslation();

  return (
    <IonItem className="sectionHeader">
      <IonText>
        <h3>
          {title} {idx + 1}
        </h3>
      </IonText>
      <IonButton
        slot="end"
        fill="clear"
        className="icon-only small"
        onClick={() => deleteSection(idx)}
        title={t('general.delete') ?? ''}
        aria-label={t('general.delete') ?? ''}
        disabled={disabled}
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
  );
};

export default FormSectionHeader;

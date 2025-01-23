import { IonButton, IonGrid, IonRow } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainSectionType } from '../utils/constants';

interface ExpandableButtonsProps {
  toggleAllSections: (open: boolean) => void;
  sectionsOpen: MainSectionType[];
}
const ExpandableButtons: React.FC<ExpandableButtonsProps> = ({ toggleAllSections, sectionsOpen }) => {
  const { t } = useTranslation();

  const expandDisabled = sectionsOpen.every((s) => s.open);
  const collapseDisabled = sectionsOpen.every((s) => !s.open);

  return (
    <IonGrid className="ion-no-padding" style={{ margin: '0px 5px' }}>
      <IonRow className="ion-justify-content-end">
        <IonButton
          fill="clear"
          className={'plainButton' + (expandDisabled ? ' disabled' : '')}
          onClick={() => toggleAllSections(true)}
          style={{ margin: '0px 15px' }}
        >
          {t('general.expand-sections')}
        </IonButton>
        <IonButton fill="clear" className={'plainButton' + (collapseDisabled ? ' disabled' : '')} onClick={() => toggleAllSections(false)}>
          {t('general.collapse-sections')}
        </IonButton>
      </IonRow>
    </IonGrid>
  );
};

export default ExpandableButtons;

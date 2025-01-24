import { IonButton, IonGrid, IonRow } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainSectionOpenType } from '../../utils/constants';

interface CollapsableButtonsProps {
  toggleAllSections: (open: boolean) => void;
  sectionsOpen: MainSectionOpenType[];
}
const CollapsableButtons: React.FC<CollapsableButtonsProps> = ({ toggleAllSections, sectionsOpen }) => {
  const { t } = useTranslation();

  const expandDisabled = sectionsOpen.every((s) => s.open);
  const collapseDisabled = sectionsOpen.every((s) => !s.open);

  return (
    <IonGrid className="ion-no-padding" style={{ margin: '0px 5px' }}>
      <IonRow className="ion-justify-content-end">
        <IonButton
          data-testid="expandAllSections"
          fill="clear"
          className={'plainButton' + (expandDisabled ? ' disabled' : '')}
          onClick={() => toggleAllSections(true)}
          style={{ margin: '0px 15px' }}
        >
          {t('general.expand-sections')}
        </IonButton>
        <IonButton
          data-testid="collapseAllSections"
          fill="clear"
          className={'plainButton' + (collapseDisabled ? ' disabled' : '')}
          onClick={() => toggleAllSections(false)}
        >
          {t('general.collapse-sections')}
        </IonButton>
      </IonRow>
    </IonGrid>
  );
};

export default CollapsableButtons;

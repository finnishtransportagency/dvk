import React, { useEffect, useState } from 'react';
import { SquatCalculationInput as GraphqlSquatCalculationInput } from '../../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType, SelectOption, AreaSelectOption } from '../../../utils/constants';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { Trans, useTranslation } from 'react-i18next';
import HelpIcon from '../../../theme/img/help_icon.svg?react';
import NotificationModal from '../../NotificationModal';
import SquatCalculationInput from '../SquatCalculationInput';
import SectionHeader from '../SectionHeader';
import alertIcon from '../../../theme/img/alert_icon.svg';
import './SquatCalculationSection.css';
import { getOrphanedAreaIdsFromSquatSection } from '../../../utils/squatCalculationUtils';

interface SquatCalculationSectionProps {
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  sectionType: 'squatCalculations';
  validationErrors: ValidationType[];
  sections?: GraphqlSquatCalculationInput[];
  actionOuterTarget?: string | number;
  disabled?: boolean;
  readonly?: boolean;
  fairwaySelection?: SelectOption[];
  fairwayAreas?: AreaSelectOption[];
  isLoadingAreas?: boolean;
  isLoadingFairways?: boolean;
  showWarningLabel?: boolean;
  areasLoaded?: boolean;
}

const SquatCalculationSection: React.FC<SquatCalculationSectionProps> = ({
  updateState,
  sectionType,
  validationErrors,
  sections,
  actionOuterTarget,
  disabled = false,
  readonly = false,
  fairwaySelection,
  fairwayAreas,
  isLoadingAreas = false,
  isLoadingFairways = false,
  showWarningLabel = false,
  areasLoaded = false,
}) => {
  const { t } = useTranslation();
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<boolean[]>(new Array(sections?.length).fill(true));
  const [orphanedAreaIdsInSquatSection, setOrphanedAreaIdsInSquatSection] = useState<number[]>([]);

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  const toggleSection = (position: number) => {
    const opened = openSections.map((s, idx) => (idx === position ? !s : s));
    setOpenSections(opened);
  };

  const addSection = () => {
    if (actionOuterTarget === undefined) {
      updateState(true, sectionType);
    } else {
      updateState(true, sectionType, undefined, undefined, actionOuterTarget);
    }
    setOpenSections(openSections.concat(true));
  };

  const deleteSection = (idx: number) => {
    updateState(false, sectionType, undefined, idx, actionOuterTarget);
    setOpenSections(openSections.filter((_, i) => idx !== i));
  };

  useEffect(() => {
    if (openSections.length !== sections?.length) {
      setOpenSections(new Array(sections?.length).fill(true));
    }
  }, [sections, openSections.length]);

  useEffect(() => {
    setOrphanedAreaIdsInSquatSection(sections && fairwayAreas && areasLoaded ? getOrphanedAreaIdsFromSquatSection(sections, fairwayAreas) : []);
  }, [sections, fairwayAreas, areasLoaded]);

  return (
    <>
      <IonText>
        <h2>
          {t('fairwaycard.squat-calculation-title')}
          <IonButton
            fill="clear"
            className="icon-only xx-small labelButton"
            onClick={() => showInfoModal()}
            title={t('info') ?? ''}
            aria-label={t('info') ?? ''}
          >
            <HelpIcon />
          </IonButton>
        </h2>
      </IonText>
      {orphanedAreaIdsInSquatSection.length > 0 && (
        <IonGrid className={'squat info grid'}>
          <IonRow className="squat info row">
            <IonCol size="auto" className={'squat info icon'}>
              <IonIcon aria-hidden src={alertIcon} color="warning" />
            </IonCol>
            <IonCol className={'squat info col'}>
              <Trans
                t={t}
                i18nKey={t('general.squat-calculation-section-area-orphaned', {
                  count: orphanedAreaIdsInSquatSection.length,
                  ids: orphanedAreaIdsInSquatSection.join(', '),
                })}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
      {sections?.map((section, idx) => {
        const sectionOpen = !!openSections[idx];
        const sectionClassName = 'sectionContent' + (sectionOpen ? ' open' : ' closed');
        return (
          <div key={'squatCalculation' + idx}>
            <SectionHeader
              title={t('fairwaycard.squat-calculation')}
              idx={idx}
              deleteSection={deleteSection}
              toggleSection={toggleSection}
              open={sectionOpen}
            />
            <div className={sectionClassName} key={'squatcalculation' + idx}>
              <SquatCalculationInput
                idx={idx}
                section={section}
                updateState={updateState}
                validationErrors={validationErrors}
                readonly={readonly}
                disabled={disabled}
                fairwaySelection={fairwaySelection}
                fairwayAreas={fairwayAreas}
                isLoadingAreas={isLoadingAreas}
                isLoadingFairways={isLoadingFairways}
                areasLoaded={areasLoaded}
              />
            </div>
          </div>
        );
      })}

      <NotificationModal
        isOpen={infoModalOpen}
        closeAction={() => setInfoModalOpen(false)}
        closeTitle={t('general.close')}
        header={t('fairwaycard.squat-calculation-title')}
        i18nkey="modal.squat-calculation-add"
        message={t('general.squat-calculation-description')}
      />
      {showWarningLabel && !readonly && (
        <IonGrid className={'squat warning grid'}>
          <IonRow className="squat warning row">
            <IonCol size="auto" className={'squat warning icon'}>
              <IonIcon aria-hidden src={alertIcon} color="danger" />
            </IonCol>
            <IonCol className={'squat warning col'}>{t('general.cannot-add-section-squat-calculation')}</IonCol>
          </IonRow>
        </IonGrid>
      )}
      <IonGrid>
        <IonRow className="ion-justify-content-end">
          <IonCol size="auto">
            <IonButton data-testid="addNewCalcSection" shape="round" onClick={() => addSection()} disabled={readonly || disabled}>
              {t('general.add-section-squat-calculation')}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default SquatCalculationSection;

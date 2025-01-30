import React, { useEffect, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { QuayInput, SectionInput, TugInput, VhfInput, VtsInput } from '../../graphql/generated';
import VtsInputSection from './VtsInputSection';
import VhfInputSection from './VhfInputSection';
import TugInputSection from './TugInputSection';
import QuayInputSection from './QuayInputSection';
import SectionInputSection from './SectionInputSection';
import SectionHeader from './SectionHeader';

interface SectionProps {
  title: string;
  sections?: VtsInput[] | TugInput[] | VhfInput[] | QuayInput[] | SectionInput[] | null;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  sectionType: 'vts' | 'tug' | 'vhf' | 'quay' | 'section';
  actionOuterTarget?: string | number;
  validationErrors?: ValidationType[];
  disabled?: boolean;
  readonly?: boolean;
}

const Section: React.FC<SectionProps> = ({
  title,
  sections,
  updateState,
  sectionType,
  actionOuterTarget,
  validationErrors,
  disabled,
  readonly = false,
}) => {
  const { t } = useTranslation();

  const [openSections, setOpenSections] = useState<boolean[]>(new Array(sections?.length).fill(true));
  const [focused, setFocused] = useState<boolean>(false);

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
    // Trigger setting focus on last section's first input
    setFocused(true);
    setTimeout(() => {
      setFocused(false);
    }, 150);
  };

  const deleteSection = (idx: number) => {
    updateState(false, sectionType, undefined, idx, actionOuterTarget);
    setOpenSections(openSections.filter((s, i) => idx !== i));
  };

  useEffect(() => {
    if (openSections.length !== sections?.length) {
      setOpenSections(new Array(sections?.length).fill(true));
    }
  }, [sections, openSections.length]);

  return (
    <>
      {sections?.map((section, idx) => {
        const sectionOpen = !!openSections[idx];
        const isFocused = idx === sections.length - 1 ? focused : undefined;
        const sectionClassName = 'sectionContent subSectionMargin' + (sectionOpen ? ' open' : ' closed');
        const helperHeader = sectionType === 'quay' ? t('modal.help-title-quay') : undefined;
        const helperText = sectionType === 'quay' ? t('modal.help-description-quay') : undefined;

        return (
          <div className="formSection" key={title + idx}>
            {actionOuterTarget === undefined && (
              <SectionHeader
                title={title}
                idx={idx}
                deleteSection={deleteSection}
                toggleSection={toggleSection}
                open={sectionOpen}
                readonly={readonly}
                disabled={!readonly && disabled}
                infoTitle={helperHeader}
                infoDescription={helperText}
              />
            )}
            {actionOuterTarget !== undefined && <hr />}

            {sectionType === 'vts' && (
              <div className={sectionClassName}>
                <VtsInputSection
                  section={section as VtsInput}
                  idx={idx}
                  updateState={updateState}
                  focused={isFocused}
                  validationErrors={validationErrors}
                  readonly={readonly}
                  disabled={!readonly && disabled}
                />
                <Section
                  title={''}
                  sections={(section as VtsInput).vhf as VhfInput[]}
                  updateState={updateState}
                  sectionType="vhf"
                  actionOuterTarget={idx}
                  validationErrors={validationErrors}
                  readonly={readonly}
                  disabled={!readonly && disabled}
                />
              </div>
            )}

            {sectionType === 'vhf' && (
              <VhfInputSection
                className={sectionClassName}
                section={section as VhfInput}
                idx={idx}
                updateState={updateState}
                deleteSection={deleteSection}
                focused={isFocused}
                validationErrors={validationErrors}
                readonly={readonly}
                disabled={!readonly && disabled}
                actionOuterTarget={actionOuterTarget}
              />
            )}

            {sectionType === 'tug' && (
              <TugInputSection
                className={sectionClassName}
                section={section as TugInput}
                idx={idx}
                updateState={updateState}
                focused={isFocused}
                validationErrors={validationErrors}
                readonly={readonly}
                disabled={!readonly && disabled}
              />
            )}

            {sectionType === 'quay' && (
              <div className={sectionClassName}>
                <QuayInputSection
                  section={section as QuayInput}
                  idx={idx}
                  updateState={updateState}
                  focused={isFocused}
                  validationErrors={validationErrors}
                  readonly={readonly}
                  disabled={!readonly && disabled}
                />
                <Section
                  title={''}
                  sections={(section as QuayInput).sections as SectionInput[]}
                  updateState={updateState}
                  sectionType="section"
                  actionOuterTarget={idx}
                  validationErrors={validationErrors}
                  readonly={readonly}
                  disabled={!readonly && disabled}
                />
              </div>
            )}

            {sectionType === 'section' && (
              <SectionInputSection
                className={sectionClassName}
                section={section as SectionInput}
                idx={idx}
                updateState={updateState}
                deleteSection={deleteSection}
                focused={isFocused}
                validationErrors={validationErrors}
                readonly={readonly}
                disabled={!readonly && disabled}
                actionOuterTarget={actionOuterTarget}
              />
            )}
          </div>
        );
      })}

      <IonGrid>
        <IonRow className="ion-justify-content-end">
          <IonCol size="auto">
            <IonButton shape="round" onClick={() => addSection()} disabled={readonly || disabled}>
              {t('general.add-section-' + sectionType)}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default Section;

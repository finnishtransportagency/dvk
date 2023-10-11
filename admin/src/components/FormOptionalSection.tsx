import React, { useEffect, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { QuayInput, SectionInput, TugInput, VhfInput, VtsInput } from '../graphql/generated';
import FormVtsInputSection from './FormVtsInputSection';
import FormVhfInputSection from './FormVhfInputSection';
import FormTugInputSection from './FormTugInputSection';
import FormQuayInputSection from './FormQuayInputSection';
import FormSectionInputSection from './FormSectionInputSection';
import FormSectionHeader from './FormSectionHeader';

interface FormSectionProps {
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
}

const FormOptionalSection: React.FC<FormSectionProps> = ({
  title,
  sections,
  updateState,
  sectionType,
  actionOuterTarget,
  validationErrors,
  disabled,
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

        return (
          <div className="formSection" key={title + idx}>
            {actionOuterTarget === undefined && (
              <FormSectionHeader
                title={title}
                idx={idx}
                deleteSection={deleteSection}
                toggleSection={toggleSection}
                open={sectionOpen}
                disabled={disabled}
              />
            )}
            {actionOuterTarget !== undefined && <hr />}

            {sectionType === 'vts' && (
              <FormVtsInputSection
                section={section as VtsInput}
                idx={idx}
                updateState={updateState}
                open={sectionOpen}
                focused={isFocused}
                validationErrors={validationErrors}
                disabled={disabled}
              />
            )}

            {sectionType === 'vhf' && (
              <FormVhfInputSection
                section={section as VhfInput}
                idx={idx}
                updateState={updateState}
                deleteSection={deleteSection}
                open={sectionOpen}
                focused={isFocused}
                validationErrors={validationErrors}
                disabled={disabled}
                actionOuterTarget={actionOuterTarget}
              />
            )}

            {sectionType === 'tug' && (
              <FormTugInputSection
                section={section as TugInput}
                idx={idx}
                updateState={updateState}
                open={sectionOpen}
                focused={isFocused}
                validationErrors={validationErrors}
                disabled={disabled}
              />
            )}

            {sectionType === 'quay' && (
              <FormQuayInputSection
                section={section as QuayInput}
                idx={idx}
                updateState={updateState}
                open={sectionOpen}
                focused={isFocused}
                validationErrors={validationErrors}
                disabled={disabled}
              />
            )}

            {sectionType === 'section' && (
              <FormSectionInputSection
                section={section as SectionInput}
                idx={idx}
                updateState={updateState}
                deleteSection={deleteSection}
                open={sectionOpen}
                focused={isFocused}
                validationErrors={validationErrors}
                disabled={disabled}
                actionOuterTarget={actionOuterTarget}
              />
            )}
          </div>
        );
      })}

      <IonGrid>
        <IonRow className="ion-justify-content-end">
          <IonCol size="auto">
            <IonButton shape="round" onClick={() => addSection()} disabled={disabled}>
              {t('general.add-section-' + sectionType)}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default FormOptionalSection;

import React from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { SectionInput } from '../../graphql/generated';
import BinIcon from '../../theme/img/bin.svg?react';

interface SectionInputSectionProps {
  className: string;
  section: SectionInput;
  idx: number;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  deleteSection: (idx: number) => void;
  focused?: boolean;
  validationErrors?: ValidationType[];
  disabled?: boolean;
  actionOuterTarget?: string | number;
}

const SectionInputSection: React.FC<SectionInputSectionProps> = ({
  className,
  section,
  idx,
  updateState,
  deleteSection,
  focused,
  validationErrors,
  disabled,
  actionOuterTarget,
}) => {
  const { t } = useTranslation();

  return (
    <IonGrid className={'formGrid ' + className}>
      <IonRow>
        <IonCol>
          <TextInput
            label={t('harbour.section-name')}
            val={section.name}
            setValue={updateState}
            actionType="sectionName"
            actionTarget={idx}
            actionOuterTarget={actionOuterTarget}
            disabled={disabled}
            focused={focused}
            infoTitle={t('modal.help-title-section')}
            infoDescription={t('modal.help-description-section')}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('harbour.depth')}
            val={section.depth}
            setValue={updateState}
            actionType="sectionDepth"
            actionTarget={idx}
            actionOuterTarget={actionOuterTarget}
            inputType="number"
            unit="m"
            max={999.99}
            decimalCount={2}
            disabled={disabled}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('harbour.lat')}
            val={section.geometry?.lat}
            setValue={updateState}
            actionType="sectionLat"
            actionTarget={idx}
            actionOuterTarget={actionOuterTarget}
            required={!!section.geometry?.lat || !!section.geometry?.lon}
            inputType="latitude"
            error={
              (!section.geometry?.lat && section.geometry?.lon
                ? validationErrors?.find((error) => error.id === 'sectionGeometry-' + actionOuterTarget + '-' + idx)?.msg
                : undefined) ?? validationErrors?.find((error) => error.id === 'sectionLocation-' + actionOuterTarget + '-' + idx)?.msg
            }
            disabled={disabled}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('harbour.lon')}
            val={section.geometry?.lon}
            setValue={updateState}
            actionType="sectionLon"
            actionTarget={idx}
            actionOuterTarget={actionOuterTarget}
            required={!!section.geometry?.lat || !!section.geometry?.lon}
            inputType="longitude"
            error={
              (section.geometry?.lat && !section.geometry?.lon
                ? validationErrors?.find((error) => error.id === 'sectionGeometry-' + actionOuterTarget + '-' + idx)?.msg
                : undefined) ?? validationErrors?.find((error) => error.id === 'sectionLocation-' + actionOuterTarget + '-' + idx)?.msg
            }
            disabled={disabled}
          />
        </IonCol>
        <IonCol size="auto" className="ion-align-self-center">
          <IonButton
            fill="clear"
            className="icon-only small"
            onClick={() => deleteSection(idx)}
            title={t('general.delete') ?? ''}
            aria-label={t('general.delete') ?? ''}
            disabled={disabled}
          >
            <BinIcon />
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default SectionInputSection;

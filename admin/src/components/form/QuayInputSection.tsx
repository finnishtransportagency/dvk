import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { QuayInput } from '../../graphql/generated';
import TextInputRow from './TextInputRow';

interface QuayInputSectionProps {
  section: QuayInput;
  idx: number;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  focused?: boolean;
  validationErrors?: ValidationType[];
  disabled?: boolean;
  readonly?: boolean;
}

const QuayInputSection: React.FC<QuayInputSectionProps> = ({ section, idx, updateState, focused, validationErrors, disabled, readonly = false }) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="formGrid subSectionMargin">
      <TextInputRow
        labelKey="harbour.quay-name"
        value={section.name}
        actionType="quayName"
        updateState={updateState}
        actionTarget={idx}
        required={!!(section.name?.fi || section.name?.sv || section.name?.en)}
        error={
          section.name?.fi || section.name?.sv || section.name?.en
            ? validationErrors?.find((error) => error.id === 'quayName-' + idx)?.msg
            : undefined
        }
        readonly={readonly}
        disabled={!readonly && disabled}
        focused={focused}
      />
      <TextInputRow
        labelKey="harbour.quay-extra-info"
        value={section.extraInfo}
        actionType="quayExtraInfo"
        updateState={updateState}
        actionTarget={idx}
        required={!!(section.extraInfo?.fi || section.extraInfo?.sv || section.extraInfo?.en)}
        error={
          section.extraInfo?.fi || section.extraInfo?.sv || section.extraInfo?.en
            ? validationErrors?.find((error) => error.id === 'quayExtraInfo-' + idx)?.msg
            : undefined
        }
        readonly={readonly}
        disabled={!readonly && disabled}
      />
      <IonRow>
        <IonCol sizeMd="4">
          <TextInput
            label={t('harbour.length')}
            val={section.length}
            setValue={updateState}
            actionType="quayLength"
            actionTarget={idx}
            inputType="number"
            unit="m"
            max={9999.9}
            decimalCount={1}
            readonly={readonly}
            disabled={!readonly && disabled}
          />
        </IonCol>
        <IonCol sizeMd="4">
          <TextInput
            label={t('harbour.lat')}
            val={section.geometry?.lat}
            setValue={updateState}
            actionType="quayLat"
            actionTarget={idx}
            inputType="latitude"
            required
            error={
              validationErrors?.find((error) => error.id === 'quayLat-' + idx)?.msg ??
              validationErrors?.find((error) => error.id === 'quayLocation-' + idx)?.msg
            }
            readonly={readonly}
            disabled={!readonly && disabled}
          />
        </IonCol>
        <IonCol sizeMd="4">
          <TextInput
            label={t('harbour.lon')}
            val={section.geometry?.lon}
            setValue={updateState}
            actionType="quayLon"
            actionTarget={idx}
            inputType="longitude"
            required
            error={
              validationErrors?.find((error) => error.id === 'quayLon-' + idx)?.msg ??
              validationErrors?.find((error) => error.id === 'quayLocation-' + idx)?.msg
            }
            readonly={readonly}
            disabled={!readonly && disabled}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default QuayInputSection;

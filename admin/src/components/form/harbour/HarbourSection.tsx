import React from 'react';
import { IonGrid } from '@ionic/react';
import { HarborInput, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';

interface HarbourSectionProps {
  state: HarborInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  readonly: boolean;
}

const HarbourSection: React.FC<HarbourSectionProps> = ({ state, updateState, validationErrors, readonly = false }) => {
  return (
    <IonGrid className="formGrid">
      <TextInputRow
        labelKey="harbour.name"
        value={state.name}
        name="harbourName"
        updateState={updateState}
        actionType="name"
        required
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'name')?.msg}
      />
      <TextInputRow
        labelKey="harbour.extra-info"
        value={state.extraInfo}
        updateState={updateState}
        actionType="extraInfo"
        required={!!state.extraInfo?.fi || !!state.extraInfo?.sv || !!state.extraInfo?.en}
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'extraInfo')?.msg}
        inputType="textarea"
      />
      <TextInputRow
        labelKey="harbour.cargo"
        value={state.cargo}
        updateState={updateState}
        actionType="cargo"
        required={!!state.cargo?.fi || !!state.cargo?.sv || !!state.cargo?.en}
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'cargo')?.msg}
        inputType="textarea"
      />
      <TextInputRow
        labelKey="harbour.harbour-basin"
        value={state.harborBasin}
        updateState={updateState}
        actionType="harbourBasin"
        required={!!state.harborBasin?.fi || !!state.harborBasin?.sv || !!state.harborBasin?.en}
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'harbourBasin')?.msg}
        inputType="textarea"
      />
    </IonGrid>
  );
};

export default HarbourSection;

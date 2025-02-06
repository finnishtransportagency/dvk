import React from 'react';
import { FairwayCardInput, Status } from '../../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';
import { IonGrid } from '@ionic/react';
import MarkdownInputRow from '../MarkdownInputRow';

interface AdditionalInfoSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  readonly?: boolean;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ state, updateState, validationErrors, readonly = false }) => {
  return (
    <IonGrid className="formGrid">
      <MarkdownInputRow
        labelKey="fairwaycard.fairway-additional-info"
        value={state.additionalInfo}
        updateState={updateState}
        actionType="additionalInfo"
        required={!!state.additionalInfo?.fi || !!state.additionalInfo?.sv || !!state.additionalInfo?.en}
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'additionalInfo')?.msg}
      />
    </IonGrid>
  );
};

export default AdditionalInfoSection;

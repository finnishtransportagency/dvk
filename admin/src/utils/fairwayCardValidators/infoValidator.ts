import { FairwayCardInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType } from '../constants';
import { isTextTranslationEmpty, validateMandatoryField } from '../validatorUtils';

export const infoValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  const validateMandatory = (input: TextInput) => {
    validateMandatoryField(input, validationErrors, actionType, (v) => isTextTranslationEmpty(v as TextInput), setValidationErrors);
  };
  if (actionType === 'line') {
    validateMandatory(newState.lineText as TextInput);
  } else if (actionType === 'designSpeed') {
    validateMandatory(newState.designSpeed as TextInput);
  } else if (actionType === 'speedLimit') {
    validateMandatory(newState.speedLimit as TextInput);
  } else if (actionType === 'anchorage') {
    validateMandatory(newState.anchorage as TextInput);
  }
};

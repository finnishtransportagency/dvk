import { FairwayCardInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType } from '../constants';
import { isTextTranslationEmpty, validateMandatoryField } from '../validatorUtils';

export const conditionValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  const validateMandatory = (input: TextInput) => {
    validateMandatoryField(input, validationErrors, actionType, (v) => isTextTranslationEmpty(v as TextInput), setValidationErrors);
  };
  if (actionType === 'navigationCondition') {
    validateMandatory(newState.navigationCondition as TextInput);
  } else if (actionType === 'iceCondition') {
    validateMandatory(newState.iceCondition as TextInput);
  }
};

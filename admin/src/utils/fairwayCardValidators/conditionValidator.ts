import { FairwayCardInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType } from '../constants';
import { isTextTranslationEmpty, validateMandatoryField } from '../validatorUtils';

export const conditionValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  if (actionType === 'navigationCondition') {
    validateMandatoryField(
      newState.navigationCondition as TextInput,
      validationErrors,
      'navigationCondition',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  } else if (actionType === 'iceCondition') {
    validateMandatoryField(
      newState.iceCondition as TextInput,
      validationErrors,
      'iceCondition',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  }
};

import { FairwayCardInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType } from '../constants';
import { isTextTranslationEmpty, validateMandatoryField } from '../validatorUtils';

export const infoValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  if (actionType === 'line') {
    validateMandatoryField(
      newState.lineText as TextInput,
      validationErrors,
      'line',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  } else if (actionType === 'designSpeed') {
    validateMandatoryField(
      newState.designSpeed as TextInput,
      validationErrors,
      'designSpeed',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  } else if (actionType === 'speedLimit') {
    validateMandatoryField(
      newState.speedLimit as TextInput,
      validationErrors,
      'speedLimit',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  } else if (actionType === 'anchorage') {
    validateMandatoryField(
      newState.anchorage as TextInput,
      validationErrors,
      'anchorage',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  }
};

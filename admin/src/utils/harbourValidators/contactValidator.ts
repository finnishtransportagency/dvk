import { HarborInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType, ValueType } from '../constants';
import { validateMandatoryField, isTextTranslationEmpty } from '../validatorUtils';

export const contactValidator = (
  newState: HarborInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  if (actionType === 'lat') {
    validateMandatoryField(value, validationErrors, 'lat', (v) => v === null || (v as string).length < 1, setValidationErrors);
  } else if (actionType === 'lon') {
    validateMandatoryField(value, validationErrors, 'lon', (v) => v === null || (v as string).length < 1, setValidationErrors);
  } else if (actionType === 'companyName') {
    validateMandatoryField(
      newState.company as TextInput,
      validationErrors,
      'companyName',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  }
};

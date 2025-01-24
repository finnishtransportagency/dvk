import { t } from 'i18next';
import { HarborInput, TextInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';

export const contactValidator = (
  newState: HarborInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  function validateMandatoryField(
    value: ValueType | TextInput | undefined,
    validationErrors: ValidationType[],
    errorIdToFill: string,
    nullCheck: (value: ValueType | TextInput | undefined) => boolean
  ) {
    if (validationErrors.find((error) => error.id === errorIdToFill)?.msg) {
      setValidationErrors(
        validationErrors
          .filter((error) => error.id !== errorIdToFill)
          .concat({
            id: errorIdToFill,
            msg: nullCheck(value) ? t(ErrorMessageKeys?.required) || '' : '',
          })
      );
    }
  }

  function isTextTranslationEmpty(text: TextInput | undefined): boolean {
    return text?.fi.trim().length === 0 || text?.sv.trim().length === 0 || text?.en.trim().length === 0;
  }

  if (actionType === 'lat') {
    validateMandatoryField(value, validationErrors, 'lat', (v) => v === null || (v as string).length < 1);
  } else if (actionType === 'lon') {
    validateMandatoryField(value, validationErrors, 'lon', (v) => v === null || (v as string).length < 1);
  } else if (actionType === 'companyName') {
    validateMandatoryField(newState.company as TextInput, validationErrors, 'companyName', (v) => isTextTranslationEmpty(v as TextInput));
  }
};

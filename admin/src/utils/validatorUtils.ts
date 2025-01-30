import { t } from 'i18next';
import { TextInput } from '../graphql/generated';
import { ErrorMessageKeys, ValidationType, ValueType } from './constants';

export function validateMandatoryField(
  value: ValueType | TextInput | undefined,
  validationErrors: ValidationType[],
  errorIdToFill: string,
  nullCheck: (value: ValueType | TextInput | undefined) => boolean,
  setValidationErrors: (validationErrors: ValidationType[]) => void
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

export function isTextTranslationEmpty(text: TextInput | undefined): boolean {
  return text?.fi.trim().length === 0 || text?.sv.trim().length === 0 || text?.en.trim().length === 0;
}

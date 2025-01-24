import { t } from 'i18next';
import { HarborInput, Operation, TextInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';

export const infoValidator = (
  state: HarborInput,
  newState: HarborInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  reservedIds?: string[]
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

  if (actionType === 'primaryId' && state.operation === Operation.Create) {
    let primaryIdErrorMsg = '';
    if (reservedIds?.includes(value as string)) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
    if ((value as string).length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    setValidationErrors(validationErrors.filter((error) => error.id !== 'primaryId').concat({ id: 'primaryId', msg: primaryIdErrorMsg }));
  } else if (actionType === 'name') {
    validateMandatoryField(value, validationErrors, 'name', (v) => v === null || (v as string).length < 1);
  } else if (actionType === 'extraInfo') {
    validateMandatoryField(newState.extraInfo as TextInput, validationErrors, 'extraInfo', (v) => isTextTranslationEmpty(v as TextInput));
  } else if (actionType === 'cargo') {
    validateMandatoryField(newState.cargo as TextInput, validationErrors, 'cargo', (v) => isTextTranslationEmpty(v as TextInput));
  } else if (actionType === 'harbourBasin') {
    validateMandatoryField(newState.harborBasin as TextInput, validationErrors, 'harbourBasin', (v) => isTextTranslationEmpty(v as TextInput));
  }
};

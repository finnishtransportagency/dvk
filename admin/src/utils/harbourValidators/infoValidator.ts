import { t } from 'i18next';
import { HarborInput, Operation, TextInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';
import { validateMandatoryField, isTextTranslationEmpty } from '../validatorUtils';

export const infoValidator = (
  state: HarborInput,
  newState: HarborInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  reservedIds?: string[]
) => {
  const validateMandatory = (input: TextInput) => {
    validateMandatoryField(input, validationErrors, actionType, (v) => isTextTranslationEmpty(v as TextInput), setValidationErrors);
  };

  if (actionType === 'primaryId' && state.operation === Operation.Create) {
    let primaryIdErrorMsg = '';
    if (reservedIds?.includes(value as string)) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
    if ((value as string).length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    setValidationErrors(validationErrors.filter((error) => error.id !== 'primaryId').concat({ id: 'primaryId', msg: primaryIdErrorMsg }));
  } else if (actionType === 'name') {
    validateMandatoryField(value, validationErrors, 'name', (v) => v === null || (v as string).length < 1, setValidationErrors);
  } else if (actionType === 'extraInfo') {
    validateMandatory(newState.extraInfo as TextInput);
  } else if (actionType === 'cargo') {
    validateMandatory(newState.cargo as TextInput);
  } else if (actionType === 'harbourBasin') {
    validateMandatory(newState.harborBasin as TextInput);
  }
};

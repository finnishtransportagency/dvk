import { t } from 'i18next';
import { FairwayCardInput, Operation } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';
import { validateMandatoryField } from '../validatorUtils';

export const generalInfoValidator = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  reservedIds?: string[]
) => {
  if (actionType === 'primaryId' && state.operation === Operation.Create) {
    let primaryIdErrorMsg = '';
    if (reservedIds?.includes(value as string)) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
    if ((value as string).length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    setValidationErrors(validationErrors.filter((error) => error.id !== 'primaryId').concat({ id: 'primaryId', msg: primaryIdErrorMsg }));
  } else if (actionType === 'name') {
    validateMandatoryField(value, validationErrors, 'name', (v) => (v as string).length < 1, setValidationErrors);
  } else if (actionType === 'fairwayIds') {
    validateMandatoryField(value, validationErrors, 'fairwayIds', (v) => (v as number[]).length < 1, setValidationErrors);
  } else if (actionType === 'fairwayPrimary') {
    validateMandatoryField(value, validationErrors, 'fairwayPrimary', (v) => (v as number[]).length < 1, setValidationErrors);
  } else if (actionType === 'fairwaySecondary') {
    validateMandatoryField(value, validationErrors, 'fairwaySecondary', (v) => (v as number[]).length < 1, setValidationErrors);
  } else if (actionType === 'group') {
    validateMandatoryField(value, validationErrors, 'group', (v) => (v as string).length < 1, setValidationErrors);
  }
};

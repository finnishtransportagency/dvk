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
  switch (actionType) {
    case 'primaryId':
      if (state.operation === Operation.Create) {
        let primaryIdErrorMsg = '';
        if (reservedIds?.includes(value as string)) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
        if ((value as string).length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
        setValidationErrors(validationErrors.filter((error) => error.id !== 'primaryId').concat({ id: 'primaryId', msg: primaryIdErrorMsg }));
      }
      break;
    case 'name':
    case 'group':
      validateMandatoryField(value, validationErrors, actionType, (v) => (v as string).length < 1, setValidationErrors);
      break;
    case 'fairwayIds':
    case 'fairwayPrimary':
    case 'fairwaySecondary':
      validateMandatoryField(value, validationErrors, actionType, (v) => (v as number[]).length < 1, setValidationErrors);
      break;
    default:
      break;
  }
};

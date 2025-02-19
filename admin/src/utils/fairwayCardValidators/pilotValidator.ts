import { FairwayCardInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType } from '../constants';
import { isTextTranslationEmpty, validateMandatoryField } from '../validatorUtils';

export const pilotValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  if (actionType === 'pilotExtraInfo') {
    validateMandatoryField(
      newState.trafficService?.pilot?.extraInfo as TextInput,
      validationErrors,
      'pilotExtraInfo',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  }
};

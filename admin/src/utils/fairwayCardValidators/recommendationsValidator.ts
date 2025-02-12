import { FairwayCardInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType } from '../constants';
import { isTextTranslationEmpty, validateMandatoryField } from '../validatorUtils';

export const recommendationsValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  const validateMandatory = (input: TextInput) => {
    validateMandatoryField(input, validationErrors, actionType, (v) => isTextTranslationEmpty(v as TextInput), setValidationErrors);
  };
  if (actionType === 'windRecommendation') {
    validateMandatory(newState.windRecommendation as TextInput);
  } else if (actionType === 'vesselRecommendation') {
    validateMandatory(newState.vesselRecommendation as TextInput);
  } else if (actionType === 'visibility') {
    validateMandatory(newState.visibility as TextInput);
  }
};

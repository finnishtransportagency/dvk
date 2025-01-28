import { FairwayCardInput, TextInput } from '../../graphql/generated';
import { ActionType, ValidationType } from '../constants';
import { isTextTranslationEmpty, validateMandatoryField } from '../validatorUtils';

export const recommendationsValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void
) => {
  if (actionType === 'windRecommendation') {
    validateMandatoryField(
      newState.windRecommendation as TextInput,
      validationErrors,
      'windRecommendation',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  } else if (actionType === 'vesselRecommendation') {
    validateMandatoryField(
      newState.vesselRecommendation as TextInput,
      validationErrors,
      'vesselRecommendation',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  } else if (actionType === 'visibility') {
    validateMandatoryField(
      newState.visibility as TextInput,
      validationErrors,
      'visibility',
      (v) => isTextTranslationEmpty(v as TextInput),
      setValidationErrors
    );
  }
};

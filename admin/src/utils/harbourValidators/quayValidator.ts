import { t } from 'i18next';
import { HarborInput, QuayInput, TextInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType } from '../constants';
import { locationError, QuayOrSection } from '../formValidations';
import { isTextTranslationEmpty } from '../validatorUtils';

export const quayValidator = (
  newState: HarborInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  const validateMandatoryField = (nullCheck: (calc: QuayInput | undefined) => boolean) => {
    if (actionTarget !== undefined && validationErrors.find((error) => error.id === actionType + '-' + actionTarget)?.msg) {
      const currentQuay = newState.quays?.find((c, idx) => idx === actionTarget) as QuayInput;
      setValidationErrors(
        validationErrors
          .filter((error) => error.id !== actionType + '-' + actionTarget)
          .concat({
            id: actionType + '-' + actionTarget,
            msg: nullCheck(currentQuay) ? t(ErrorMessageKeys?.required) || '' : '',
          })
      );
    }
  };

  if (actionType === 'quayName') {
    validateMandatoryField((quay) => isTextTranslationEmpty(quay?.name as TextInput));
  } else if (actionType === 'quayExtraInfo') {
    validateMandatoryField((quay) => isTextTranslationEmpty(quay?.extraInfo as TextInput));
  } else if (actionType === 'quayLat' && validationErrors.find((error) => error.id === 'quayLat-' + actionTarget)?.msg) {
    validateMandatoryField((quay) => quay?.geometry?.lat === null || (quay?.geometry?.lat as string).length < 1);
  } else if (actionType === 'quayLon' && validationErrors.find((error) => error.id === 'quayLon-' + actionTarget)?.msg) {
    validateMandatoryField((quay) => quay?.geometry?.lon === null || (quay?.geometry?.lon as string).length < 1);
  } else if ((actionType === 'quayLat' || actionType === 'quayLon') && actionTarget !== undefined) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'quayLocation-' + actionTarget)
        .concat({
          id: 'quayLocation-' + actionTarget,
          msg: locationError(
            { actionTarget: String(actionTarget), geometry: currentQuay?.geometry } as QuayOrSection,
            newState.quays?.map((q, i) => ({ geometry: q?.geometry, actionTarget: String(i) }) as QuayOrSection)
          )
            ? t(ErrorMessageKeys?.duplicateLocation) || ''
            : '',
        })
    );
  } else if (actionType === 'quay' && actionTarget !== undefined) {
    const quayFieldErrors: ValidationType[] = [];
    validationErrors
      .filter(
        (error) =>
          error.id.startsWith('quayName-') ||
          error.id.startsWith('quayExtraInfo-') ||
          error.id.startsWith('quayLat-') ||
          error.id.startsWith('quayLon-') ||
          error.id.startsWith('sectionGeometry-') ||
          error.id.startsWith('quayLocation-') ||
          error.id.startsWith('sectionLocation-')
      )
      .forEach((error) => {
        const errorSplitted = error.id.split('-');
        if (errorSplitted[1] < actionTarget) quayFieldErrors.push(error);
        if (errorSplitted[1] > actionTarget) {
          quayFieldErrors.push({
            id: errorSplitted[0] + '-' + (Number(errorSplitted[1]) - 1) + (errorSplitted[2] !== undefined ? '-' + errorSplitted[2] : ''),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors
        .filter(
          (error) =>
            !error.id.startsWith('quayName-') &&
            !error.id.startsWith('quayExtraInfo-') &&
            !error.id.startsWith('quayLat-') &&
            !error.id.startsWith('quayLon-') &&
            !error.id.startsWith('sectionGeometry-') &&
            !error.id.startsWith('quayLocation-') &&
            !error.id.startsWith('sectionLocation-')
        )
        .concat(quayFieldErrors)
    );
  }
};

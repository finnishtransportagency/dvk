import { t } from 'i18next';
import { HarborInput, QuayInput, TextInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';
import { locationError, QuayOrSection } from '../formValidations';

export const quayValidator = (
  newState: HarborInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  function validateMandatoryField(
    actionTarget: string | number | undefined,
    validationErrors: ValidationType[],
    errorPrefix: string,
    nullCheck: (calc: QuayInput | undefined) => boolean
  ) {
    if (actionTarget !== undefined && validationErrors.find((error) => error.id === errorPrefix + '-' + actionTarget)?.msg) {
      const currentQuay = newState.quays?.find((c, idx) => idx === actionTarget) as QuayInput;
      setValidationErrors(
        validationErrors
          .filter((error) => error.id !== errorPrefix + '-' + actionTarget)
          .concat({
            id: errorPrefix + '-' + actionTarget,
            msg: nullCheck(currentQuay) ? t(ErrorMessageKeys?.required) || '' : '',
          })
      );
    }
  }

  function isTextTranslationEmpty(text: TextInput | undefined): boolean {
    return text?.fi.trim().length === 0 || text?.sv.trim().length === 0 || text?.en.trim().length === 0;
  }

  if (actionType === 'quayName') {
    validateMandatoryField(actionTarget, validationErrors, actionType, (quay) => isTextTranslationEmpty(quay?.name as TextInput));
  } else if (actionType === 'quayExtraInfo') {
    validateMandatoryField(actionTarget, validationErrors, actionType, (quay) => isTextTranslationEmpty(quay?.extraInfo as TextInput));
  } else if (actionType === 'quayLat' && validationErrors.find((error) => error.id === 'quayLat-' + actionTarget)?.msg) {
    validateMandatoryField(
      actionTarget,
      validationErrors,
      actionType,
      (quay) => quay?.geometry?.lat === null || (quay?.geometry?.lat as string).length < 1
    );
  } else if (actionType === 'quayLon' && validationErrors.find((error) => error.id === 'quayLon-' + actionTarget)?.msg) {
    validateMandatoryField(
      actionTarget,
      validationErrors,
      actionType,
      (quay) => quay?.geometry?.lon === null || (quay?.geometry?.lon as string).length < 1
    );
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

import { t } from 'i18next';
import { HarborInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType } from '../constants';
import { locationError, QuayOrSection } from '../formValidations';

export const sectionValidator = (
  newState: HarborInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
) => {
  const currentQuay = newState.quays?.find((_quayItem, idx) => idx === actionOuterTarget);
  const currentSection = currentQuay?.sections?.find((_sectionItem, jdx) => jdx === actionTarget);

  //Refactor the whole of this validation module to a common place as it's used elsewhere
  if (actionType === 'section' && actionTarget !== undefined && actionOuterTarget !== undefined) {
    const sectionFieldErrors: ValidationType[] = [];
    validationErrors
      .filter((error) => error.id.startsWith('sectionGeometry-' + actionOuterTarget + '-'))
      .forEach((error) => {
        const errorIndex = error.id.split('sectionGeometry-' + actionOuterTarget + '-')[1];
        if (errorIndex < actionTarget) sectionFieldErrors.push(error);
        if (errorIndex > actionTarget) {
          sectionFieldErrors.push({
            id: 'sectionGeometry-' + actionOuterTarget + '-' + (Number(errorIndex) - 1),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors.filter((error) => !error.id.startsWith('sectionGeometry-' + actionOuterTarget + '-')).concat(sectionFieldErrors)
    );
  } else if (
    (actionType === 'sectionLat' || actionType === 'sectionLon') &&
    actionTarget !== undefined &&
    actionOuterTarget !== undefined &&
    validationErrors.find((error) => error.id === 'sectionGeometry-' + actionOuterTarget + '-' + actionTarget)?.msg
  ) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'sectionGeometry-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'sectionGeometry-' + actionOuterTarget + '-' + actionTarget,
          msg: currentSection?.geometry?.lat.trim() || currentSection?.geometry?.lon.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if ((actionType === 'sectionLat' || actionType === 'sectionLon') && actionTarget !== undefined && actionOuterTarget !== undefined) {
    const target = actionOuterTarget + '-' + actionTarget;
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'sectionLocation-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'sectionLocation-' + target,
          msg: locationError(
            { actionTarget: target, geometry: currentSection?.geometry } as QuayOrSection,
            newState.quays?.flatMap(
              (q, qIdx) => q?.sections?.map((s, sIdx) => ({ geometry: s?.geometry, actionTarget: qIdx + '-' + sIdx }) as QuayOrSection) ?? []
            )
          )
            ? t(ErrorMessageKeys?.duplicateLocation) || ''
            : '',
        })
    );
  }
};

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
  if (actionTarget == undefined || actionOuterTarget == undefined) {
    return;
  }

  const currentQuay = newState.quays?.find((_quayItem, idx) => idx === actionOuterTarget);
  const currentSection = currentQuay?.sections?.find((_sectionItem, jdx) => jdx === actionTarget);

  const itemLocate = (actionType: string, includeActionTarget: boolean = true): string => {
    return actionType + '-' + actionOuterTarget + '-' + (includeActionTarget ? actionTarget : '');
  };

  //Refactor the whole of this validation module to a common place as it's used elsewhere
  if (actionType === 'section') {
    const sectionFieldErrors = validationErrors
      .filter((error) => error.id.startsWith(itemLocate('sectionGeometry', false)))
      .filter((error) => error.id !== itemLocate('sectionGeometry'))
      .map((error, index) => {
        return { id: itemLocate('sectionGeometry', false) + index, msg: error.msg };
      });
    setValidationErrors(validationErrors.filter((error) => !error.id.startsWith(itemLocate('sectionGeometry', false))).concat(sectionFieldErrors));
  } else if (
    (actionType === 'sectionLat' || actionType === 'sectionLon') &&
    validationErrors.find((error) => error.id === itemLocate('sectionGeometry'))?.msg
  ) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== itemLocate('sectionGeometry'))
        .concat({
          id: itemLocate('sectionGeometry'),
          msg: currentSection?.geometry?.lat.trim() || currentSection?.geometry?.lon.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (actionType === 'sectionLat' || actionType === 'sectionLon') {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== itemLocate('sectionLocation'))
        .concat({
          id: itemLocate('sectionLocation'),
          msg: locationError(
            { actionTarget: actionOuterTarget + '-' + actionTarget, geometry: currentSection?.geometry } as QuayOrSection,
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

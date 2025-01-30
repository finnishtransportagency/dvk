import { t } from 'i18next';
import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType } from '../constants';

export const vhfValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
) => {
  //Refactor the whole of this validation module to a common place as it's used elsewhere
  if (actionType === 'vhf' && actionTarget !== undefined && actionOuterTarget !== undefined) {
    const sectionFieldErrors: ValidationType[] = [];
    validationErrors
      .filter((error) => error.id.startsWith('vhfName-' + actionOuterTarget + '-') || error.id.startsWith('vhfChannel-' + actionOuterTarget + '-'))
      .forEach((error) => {
        const errorSplitted = error.id.split('-' + actionOuterTarget + '-');
        if (errorSplitted[1] < actionTarget) sectionFieldErrors.push(error);
        if (errorSplitted[1] > actionTarget) {
          sectionFieldErrors.push({
            id: errorSplitted[0] + '-' + actionOuterTarget + '-' + (Number(errorSplitted[1]) - 1),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors
        .filter(
          (error) => !error.id.startsWith('vhfName-' + actionOuterTarget + '-') && !error.id.startsWith('vhfChannel-' + actionOuterTarget + '-')
        )
        .concat(sectionFieldErrors)
    );
  } else if (
    actionType === 'vhfName' &&
    actionTarget !== undefined &&
    actionOuterTarget !== undefined &&
    validationErrors.find((error) => error.id === 'vhfName-' + actionOuterTarget + '-' + actionTarget)?.msg
  ) {
    const currentVts = newState.trafficService?.vts?.find((vtsItem, idx) => idx === actionOuterTarget);
    const currentVhf = currentVts?.vhf?.find((vhfItem, jdx) => jdx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vhfName-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'vhfName-' + actionOuterTarget + '-' + actionTarget,
          msg: currentVhf?.name?.fi.trim() || currentVhf?.name?.sv.trim() || currentVhf?.name?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'vhfChannel' &&
    actionTarget !== undefined &&
    actionOuterTarget !== undefined &&
    validationErrors.find((error) => error.id === 'vhfChannel-' + actionOuterTarget + '-' + actionTarget)?.msg
  ) {
    const currentVts = newState.trafficService?.vts?.find((vtsItem, idx) => idx === actionOuterTarget);
    const currentVhf = currentVts?.vhf?.find((vhfItem, jdx) => jdx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vhfChannel-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'vhfChannel-' + actionOuterTarget + '-' + actionTarget,
          msg: !currentVhf?.channel ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  }
};

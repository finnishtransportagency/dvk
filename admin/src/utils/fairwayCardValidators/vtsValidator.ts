import { t } from 'i18next';
import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';

export const vtsValidator = (
  newState: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  //Check with value - this probably shouold be deleted at some point as it does nothing
  if (actionType === 'vtsName' && validationErrors.find((error) => error.id === 'vtsName')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vtsName')
        .concat({ id: 'vtsName', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  }

  if (actionType === 'vts' && actionTarget !== undefined) {
    const vtsFieldErrors: ValidationType[] = [];
    validationErrors
      .filter((error) => error.id.startsWith('vtsName-') || error.id.startsWith('vhfName-') || error.id.startsWith('vhfChannel-'))
      .forEach((error) => {
        const errorSplitted = error.id.split('-');
        if (errorSplitted[1] < actionTarget) vtsFieldErrors.push(error);
        if (errorSplitted[1] > actionTarget) {
          vtsFieldErrors.push({
            id: errorSplitted[0] + '-' + (Number(errorSplitted[1]) - 1) + (errorSplitted[2] !== undefined ? '-' + errorSplitted[2] : ''),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors
        .filter((error) => !error.id.startsWith('vtsName-') && !error.id.startsWith('vhfName-') && !error.id.startsWith('vhfChannel-'))
        .concat(vtsFieldErrors)
    );
  } else if (
    actionType === 'vtsName' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'vtsName-' + actionTarget)?.msg
  ) {
    const currentVts = newState.trafficService?.vts?.find((vtsItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vtsName-' + actionTarget)
        .concat({
          id: 'vtsName-' + actionTarget,
          msg: currentVts?.name?.fi.trim() || currentVts?.name?.sv.trim() || currentVts?.name?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  }
};

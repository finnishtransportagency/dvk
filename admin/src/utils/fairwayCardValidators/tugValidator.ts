import { t } from 'i18next';
import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';

export const tugValidator = (
  newState: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  //Check with value - this probably shouold be deleted at some point as it does nothing
  if (actionType === 'tugName' && validationErrors.find((error) => error.id === 'tugName')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'tugName')
        .concat({ id: 'tugName', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  }

  //Refactor the whole of this validation module to a common place as it's used elsewhere
  if (actionType === 'tug' && actionTarget !== undefined) {
    const tugFieldErrors: ValidationType[] = validationErrors
      .filter((error) => error.id.startsWith('tugName-'))
      .filter((error) => error.id !== 'tugName-' + actionTarget)
      .map((error, index) => {
        return { id: 'tugName-' + index, msg: error.msg };
      });
    setValidationErrors(validationErrors.filter((error) => !error.id.startsWith('tugName-')).concat(tugFieldErrors));
  } else if (
    actionType === 'tugName' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'tugName-' + actionTarget)?.msg
  ) {
    const currentTug = newState.trafficService?.tugs?.find((tugItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'tugName-' + actionTarget)
        .concat({
          id: 'tugName-' + actionTarget,
          msg: currentTug?.name?.fi.trim() || currentTug?.name?.sv.trim() || currentTug?.name?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  }
};

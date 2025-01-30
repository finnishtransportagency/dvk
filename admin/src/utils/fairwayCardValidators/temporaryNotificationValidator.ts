import { t } from 'i18next';
import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType, ValueType } from '../constants';
import { dateError, endDateError } from '../common';

export const temporaryNotificationValidator = (
  newState: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  const notification = newState.temporaryNotifications?.find((_, idx) => idx === actionTarget);
  const setErrors = (errorMsg: string) => {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== actionType + '-' + actionTarget)
        .concat({
          id: actionType + '-' + actionTarget,
          msg: errorMsg,
        })
    );
  };

  // manual validations for temporary notifications (errors that shows before trying to save the whole card)
  if (actionType === 'temporaryNotificationStartDate' && actionTarget !== undefined) {
    if (!notification?.startDate) {
      setErrors(t(ErrorMessageKeys?.required));
    } else if (dateError(notification?.startDate)) {
      setErrors(t(ErrorMessageKeys?.invalid));
    } else {
      setErrors('');
    }
  } else if (actionType === 'temporaryNotificationEndDate' && actionTarget !== undefined) {
    if (notification?.endDate && dateError(notification?.endDate)) {
      setErrors(ErrorMessageKeys?.invalid);
      // only if there's valid start date check if end date is same/after start date
    } else if (
      notification?.endDate &&
      notification?.startDate &&
      !dateError(notification?.startDate) &&
      endDateError(notification?.startDate ?? '', notification?.endDate ?? '')
    ) {
      setErrors(t(ErrorMessageKeys?.endDateError));
    } else {
      setErrors('');
    }
  }
};

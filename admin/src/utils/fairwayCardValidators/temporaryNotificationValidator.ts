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
  // manual validations for temporary notifications (errors that shows before trying to save the whole card)
  if (actionType === 'temporaryNotificationStartDate' && actionTarget !== undefined) {
    const notification = newState.temporaryNotifications?.find((_, idx) => idx === actionTarget);
    let errorMsg = '';

    if (!notification?.startDate) {
      errorMsg = t(ErrorMessageKeys?.required);
    } else if (dateError(notification?.startDate)) {
      errorMsg = t(ErrorMessageKeys?.invalid);
    }

    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'temporaryNotificationStartDate-' + actionTarget)
        .concat({
          id: 'temporaryNotificationStartDate-' + actionTarget,
          msg: errorMsg,
        })
    );
  } else if (actionType === 'temporaryNotificationEndDate' && actionTarget !== undefined) {
    const notification = newState.temporaryNotifications?.find((_, idx) => idx === actionTarget);
    let errorMsg = '';

    if (notification?.endDate && dateError(notification?.endDate)) {
      errorMsg = t(ErrorMessageKeys?.invalid);
      // only if there's valid start date check if end date is same/after start date
    } else if (
      notification?.endDate &&
      notification?.startDate &&
      !dateError(notification?.startDate) &&
      endDateError(notification?.startDate ?? '', notification?.endDate ?? '')
    ) {
      errorMsg = t(ErrorMessageKeys?.endDateError);
    }
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'temporaryNotificationEndDate-' + actionTarget)
        .concat({
          id: 'temporaryNotificationEndDate-' + actionTarget,
          msg: errorMsg,
        })
    );
  }
};

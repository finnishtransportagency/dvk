import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const temporaryNotificationReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'temporaryNotifications':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          temporaryNotifications: state.temporaryNotifications?.concat({
            content: { fi: '', sv: '', en: '' },
            startDate: '',
            endDate: '',
          }),
        };
      } else {
        newState = {
          ...state,
          temporaryNotifications: state.temporaryNotifications?.filter((_, idx) => idx !== actionTarget),
        };
      }
      break;
    case 'temporaryNotificationContent':
      newState = {
        ...state,
        temporaryNotifications: state.temporaryNotifications?.map((notification, idx) =>
          idx === actionTarget
            ? {
                ...notification,
                content: {
                  ...(notification?.content ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value as string,
                },
              }
            : notification
        ),
      };
      break;
    case 'temporaryNotificationStartDate':
      newState = {
        ...state,
        temporaryNotifications: state.temporaryNotifications?.map((notification, idx) =>
          idx === actionTarget ? { ...notification, startDate: value as string } : notification
        ),
      };
      break;
    case 'temporaryNotificationEndDate':
      newState = {
        ...state,
        temporaryNotifications: state.temporaryNotifications?.map((notification, idx) =>
          idx === actionTarget ? { ...notification, endDate: value as string } : notification
        ),
      };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const tugReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'tug':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.concat([
              {
                email: '',
                name: { fi: '', sv: '', en: '' },
                phoneNumber: [],
                fax: '',
              },
            ]),
          },
        };
      } else {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.filter((tugItem, idx) => idx !== actionTarget),
          },
        };
      }
      break;
    case 'tugName':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: {
                    ...(tugItem?.name ?? { fi: '', sv: '', en: '' }),
                    [actionLang as string]: value as string,
                  },
                }
              : tugItem
          ),
        },
      };
      break;
    case 'tugEmail':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: tugItem?.name ?? { fi: '', sv: '', en: '' },
                  email: ((value as string) || '').trim(),
                }
              : tugItem
          ),
        },
      };
      break;
    case 'tugPhone':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: tugItem?.name ?? { fi: '', sv: '', en: '' },
                  phoneNumber: (value as string).split(',').map((item) => item.trim()),
                }
              : tugItem
          ),
        },
      };
      break;
    case 'tugFax':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: tugItem?.name ?? { fi: '', sv: '', en: '' },
                  fax: ((value as string) || '').trim(),
                }
              : tugItem
          ),
        },
      };
      break;

    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

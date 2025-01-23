import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const vtsReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'vts':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.concat([
              {
                email: [],
                name: { fi: '', sv: '', en: '' },
                phoneNumber: '',
                vhf: [],
              },
            ]),
          },
        };
      } else {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.filter((vtsItem, idx) => idx !== actionTarget),
          },
        };
      }
      break;
    case 'vtsName':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionTarget
              ? {
                  ...vtsItem,
                  name: {
                    ...(vtsItem?.name ?? { fi: '', sv: '', en: '' }),
                    [actionLang as string]: value as string,
                  },
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'vtsEmail':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  email: (value as string).split(',').map((item) => item.trim()),
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'vtsPhone':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  phoneNumber: ((value as string) || '').trim(),
                }
              : vtsItem
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

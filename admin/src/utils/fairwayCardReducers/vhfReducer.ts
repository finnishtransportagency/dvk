import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const vhfReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'vhf':
      // Add and delete
      if (value && actionOuterTarget !== undefined) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, i) =>
              i === actionOuterTarget
                ? {
                    ...vtsItem,
                    name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                    vhf: vtsItem?.vhf?.concat([{ channel: '', name: { fi: '', sv: '', en: '' } }]),
                  }
                : vtsItem
            ),
          },
        };
      } else if (!value && actionTarget !== undefined) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, i) => {
              if (i === actionOuterTarget) {
                return {
                  ...vtsItem,
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.filter((vhfItem, idx) => idx !== actionTarget),
                };
              } else {
                return { ...vtsItem, name: vtsItem?.name ?? { fi: '', sv: '', en: '' } };
              }
            }),
          },
        };
      } else {
        return state;
      }
      break;
    case 'vhfName':
      if (actionTarget === undefined || actionOuterTarget === undefined) return state;
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionOuterTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                    j === actionTarget
                      ? {
                          name: {
                            ...(vhfItem?.name ?? { fi: '', sv: '', en: '' }),
                            [actionLang as string]: value as string,
                          },
                          channel: vhfItem?.channel?.toString() ?? '',
                        }
                      : vhfItem
                  ),
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'vhfChannel':
      if (actionTarget === undefined || actionOuterTarget === undefined) return state;
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionOuterTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                    j === actionTarget
                      ? {
                          name: vhfItem?.name ?? { fi: '', sv: '', en: '' },
                          channel: value as string,
                        }
                      : vhfItem
                  ),
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

import { HarborInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const quayReducer = (
  state: HarborInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): HarborInput => {
  let newState;
  switch (actionType) {
    case 'quay':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          quays: state.quays?.concat([
            {
              name: { fi: '', sv: '', en: '' },
              length: '',
              geometry: { lat: '', lon: '' },
              extraInfo: { fi: '', sv: '', en: '' },
              sections: undefined,
            },
          ]),
        };
      } else {
        newState = {
          ...state,
          quays: state.quays?.filter((quayItem, idx) => idx !== actionTarget),
        };
      }
      break;
    case 'quayName':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                name: {
                  ...(quayItem?.name ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value as string,
                },
              }
            : quayItem
        ),
      };
      break;
    case 'quayLength':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                length: value as string,
              }
            : quayItem
        ),
      };
      break;
    case 'quayLat':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                geometry: { lat: (value as string) || '', lon: quayItem?.geometry?.lon ?? '' },
              }
            : quayItem
        ),
      };
      break;
    case 'quayLon':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                geometry: { lat: quayItem?.geometry?.lat ?? '', lon: (value as string) || '' },
              }
            : quayItem
        ),
      };
      break;
    case 'quayExtraInfo':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                extraInfo: {
                  ...(quayItem?.extraInfo ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value as string,
                },
              }
            : quayItem
        ),
      };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

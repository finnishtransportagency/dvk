import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const fairwayInfoReducer = (state: FairwayCardInput, value: ValueType, actionType: ActionType, actionLang?: Lang): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'line':
      if (!actionLang) return state;
      newState = {
        ...state,
        lineText: {
          ...(state.lineText ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'speedLimit':
      if (!actionLang) return state;
      newState = {
        ...state,
        speedLimit: {
          ...(state.speedLimit ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'designSpeed':
      if (!actionLang) return state;
      newState = {
        ...state,
        designSpeed: {
          ...(state.designSpeed ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'anchorage':
      if (!actionLang) return state;
      newState = {
        ...state,
        anchorage: {
          ...(state.anchorage ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

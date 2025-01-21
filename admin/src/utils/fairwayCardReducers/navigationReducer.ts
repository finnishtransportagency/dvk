import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const navigationReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'navigationCondition':
      if (!actionLang) return state;
      newState = {
        ...state,
        navigationCondition: {
          ...(state.navigationCondition ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'iceCondition':
      if (!actionLang) return state;
      newState = {
        ...state,
        iceCondition: {
          ...(state.iceCondition ?? { fi: '', sv: '', en: '' }),
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

import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const recommendationsReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'windRecommendation':
      if (!actionLang) return state;
      newState = {
        ...state,
        windRecommendation: {
          ...(state.windRecommendation ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'vesselRecommendation':
      if (!actionLang) return state;
      newState = {
        ...state,
        vesselRecommendation: {
          ...(state.vesselRecommendation ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'visibility':
      if (!actionLang) return state;
      newState = {
        ...state,
        visibility: {
          ...(state.visibility ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'mareographs':
      newState = { ...state, mareographs: value as number[] };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

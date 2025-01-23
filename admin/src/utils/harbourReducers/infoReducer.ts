import { HarborInput, Status } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const infoReducer = (
  state: HarborInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): HarborInput => {
  let newState;
  switch (actionType) {
    case 'primaryId':
      newState = { ...state, id: (value as string).toLowerCase() };
      break;
    case 'referenceLevel':
      newState = { ...state, n2000HeightSystem: !!value };
      break;
    case 'name':
      if (!actionLang) return state;
      newState = { ...state, name: { ...state.name, [actionLang as string]: value as string } };
      break;
    case 'extraInfo':
      if (!actionLang) return state;
      newState = {
        ...state,
        extraInfo: {
          ...(state.extraInfo ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'cargo':
      if (!actionLang) return state;
      newState = {
        ...state,
        cargo: {
          ...(state.cargo ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'harbourBasin':
      if (!actionLang) return state;
      newState = {
        ...state,
        harborBasin: {
          ...(state.harborBasin ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'status':
      newState = { ...state, status: value as Status };
      break;
    case 'publishDetails':
      newState = { ...state, publishDetails: value as string };
      break;

    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

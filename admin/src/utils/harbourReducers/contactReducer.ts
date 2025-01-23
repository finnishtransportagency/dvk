import { HarborInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const contactReducer = (
  state: HarborInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): HarborInput => {
  let newState;
  switch (actionType) {
    case 'companyName':
      if (!actionLang) return state;
      newState = {
        ...state,
        company: {
          ...(state.company ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'email':
      newState = { ...state, email: value as string };
      break;
    case 'phoneNumber':
      newState = { ...state, phoneNumber: (value as string).split(',').map((item) => item.trim()) };
      break;
    case 'fax':
      newState = { ...state, fax: value as string };
      break;
    case 'internet':
      newState = { ...state, internet: value as string };
      break;
    case 'lat':
      newState = { ...state, geometry: { lat: value as string, lon: state.geometry.lon } };
      break;
    case 'lon':
      newState = { ...state, geometry: { lat: state.geometry.lat, lon: value as string } };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

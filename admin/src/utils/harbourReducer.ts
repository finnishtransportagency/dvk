import { HarborInput } from '../graphql/generated';
import { ActionType, Lang, ValidationType, ValueType } from './constants';
import { infoReducer } from './harbourReducers/infoReducer';
import { contactReducer } from './harbourReducers/contactReducer';
import { quayReducer } from './harbourReducers/quayReducer';
import { sectionReducer } from './harbourReducers/sectionReducer';
import { infoValidator } from './harbourValidators/infoValidator';
import { contactValidator } from './harbourValidators/contactValidator';
import { quayValidator } from './harbourValidators/quayValidator';
import { sectionValidator } from './harbourValidators/sectionValidator';

export type ValidationParameters = {
  validationErrors: ValidationType[];
  setValidationErrors: (validationErrors: ValidationType[]) => void;
  reservedIds?: string[];
};

export const harbourReducer = (
  state: HarborInput,
  value: ValueType,
  actionType: ActionType,
  validationParameters: ValidationParameters,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
) => {
  const { validationErrors, setValidationErrors, reservedIds } = validationParameters;
  let newState;
  switch (actionType) {
    case 'primaryId':
    case 'referenceLevel':
    case 'name':
    case 'extraInfo':
    case 'cargo':
    case 'harbourBasin':
    case 'status':
    case 'publishDetails':
      newState = infoReducer(state, value, actionType, actionLang);
      infoValidator(state, newState, value, actionType, validationErrors, setValidationErrors, reservedIds);
      break;
    case 'companyName':
    case 'email':
    case 'phoneNumber':
    case 'fax':
    case 'internet':
    case 'lat':
    case 'lon':
      newState = contactReducer(state, value, actionType, actionLang);
      contactValidator(newState, value, actionType, validationErrors, setValidationErrors);
      break;
    case 'quay':
    case 'quayName':
    case 'quayLength':
    case 'quayLat':
    case 'quayLon':
    case 'quayExtraInfo':
      newState = quayReducer(state, value, actionType, actionLang, actionTarget);
      quayValidator(newState, actionType, validationErrors, setValidationErrors, actionTarget);
      break;
    case 'section':
    case 'sectionName':
    case 'sectionDepth':
    case 'sectionLat':
    case 'sectionLon':
      newState = sectionReducer(state, value, actionType, actionTarget, actionOuterTarget);
      sectionValidator(newState, actionType, validationErrors, setValidationErrors, actionTarget, actionOuterTarget);
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }

  return newState;
};

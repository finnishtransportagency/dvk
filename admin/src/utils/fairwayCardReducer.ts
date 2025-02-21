import { FairwayCardInput } from '../graphql/generated';
import { ActionType, Lang, ValidationType, ValueType } from './constants';
import { squatCalculationReducer } from './fairwayCardReducers/squatCalculationReducer';
import { squatCalculationValidator } from './fairwayCardValidators/squatCalculationValidator';
import { tugReducer } from './fairwayCardReducers/tugReducer';
import { vhfReducer } from './fairwayCardReducers/vhfReducer';
import { vtsReducer } from './fairwayCardReducers/vtsReducer';
import { generalInfoReducer } from './fairwayCardReducers/generalInfoReducer';
import { temporaryNotificationReducer } from './fairwayCardReducers/temporaryNotificationReducer';
import { fairwayInfoReducer } from './fairwayCardReducers/fairwayInfoReducer';
import { navigationReducer } from './fairwayCardReducers/navigationReducer';
import { recommendationsReducer } from './fairwayCardReducers/recommendationsReducer';
import { pilotOrderReducer } from './fairwayCardReducers/pilotOrderReducer';
import { pictureReducer } from './fairwayCardReducers/pictureReducer';
import { generalInfoValidator } from './fairwayCardValidators/generalInfoValidator';
import { infoValidator } from './fairwayCardValidators/infoValidator';
import { conditionValidator } from './fairwayCardValidators/conditionValidator';
import { recommendationsValidator } from './fairwayCardValidators/recommendationsValidator';
import { pilotValidator } from './fairwayCardValidators/pilotValidator';
import { vtsValidator } from './fairwayCardValidators/vtsValidator';
import { vhfValidator } from './fairwayCardValidators/vhfValidator';
import { tugValidator } from './fairwayCardValidators/tugValidator';
import { temporaryNotificationValidator } from './fairwayCardValidators/temporaryNotificationValidator';

export type ValidationParameters = {
  validationErrors: ValidationType[];
  setValidationErrors: (validationErrors: ValidationType[]) => void;
  reservedIds?: string[];
};
export const fairwayCardReducer = (
  state: FairwayCardInput,
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
    case 'name':
    case 'primaryId':
    case 'status':
    case 'fairwayIds':
    case 'fairwayPrimary':
    case 'fairwaySecondary':
    case 'harbours':
    case 'pilotRoutes':
    case 'referenceLevel':
    case 'group':
    case 'publishDetails':
    case 'additionalInfo':
      newState = generalInfoReducer(state, value, actionType, actionLang);
      generalInfoValidator(state, value, actionType, validationErrors, setValidationErrors, reservedIds);
      break;
    case 'line':
    case 'speedLimit':
    case 'designSpeed':
    case 'anchorage':
      newState = fairwayInfoReducer(state, value, actionType, actionLang);
      infoValidator(newState, actionType, validationErrors, setValidationErrors);
      break;
    case 'navigationCondition':
    case 'iceCondition':
      newState = navigationReducer(state, value, actionType, actionLang);
      conditionValidator(newState, actionType, validationErrors, setValidationErrors);
      break;
    case 'windRecommendation':
    case 'vesselRecommendation':
    case 'visibility':
    case 'mareographs':
      newState = recommendationsReducer(state, value, actionType, actionLang);
      recommendationsValidator(newState, actionType, validationErrors, setValidationErrors);
      break;
    case 'pilotEmail':
    case 'pilotPhone':
    case 'pilotFax':
    case 'pilotExtraInfo':
    case 'pilotPlaces':
    case 'pilotJourney':
      newState = pilotOrderReducer(state, value, actionType, actionLang, actionTarget);
      pilotValidator(newState, actionType, validationErrors, setValidationErrors);
      break;
    case 'vts':
    case 'vtsName':
    case 'vtsEmail':
    case 'vtsPhone':
    case 'vtsIds':
      newState = vtsReducer(state, value, actionType, actionLang, actionTarget);
      vtsValidator(newState, value, actionType, validationErrors, setValidationErrors, actionTarget);
      break;
    case 'vhf':
    case 'vhfName':
    case 'vhfChannel':
      newState = vhfReducer(state, value, actionType, actionLang, actionTarget, actionOuterTarget);
      vhfValidator(newState, actionType, validationErrors, setValidationErrors, actionTarget, actionOuterTarget);
      break;
    case 'tug':
    case 'tugName':
    case 'tugEmail':
    case 'tugPhone':
    case 'tugFax':
      newState = tugReducer(state, value, actionType, actionLang, actionTarget);
      tugValidator(newState, value, actionType, validationErrors, setValidationErrors, actionTarget);
      break;
    case 'picture':
    case 'pictureDescription':
    case 'pictureLegendPosition':
      newState = pictureReducer(state, value, actionType, actionLang, actionTarget);
      break;
    case 'temporaryNotifications':
    case 'temporaryNotificationContent':
    case 'temporaryNotificationStartDate':
    case 'temporaryNotificationEndDate':
      newState = temporaryNotificationReducer(state, value, actionType, actionLang, actionTarget);
      temporaryNotificationValidator(newState, actionType, validationErrors, setValidationErrors, actionTarget);
      break;
    case 'squatCalculations':
    case 'squatCalculationAdditionalInformation':
    case 'squatCalculationPlace':
    case 'squatCalculationDepth':
    case 'squatCalculationFairwayForm':
    case 'squatCalculationEstimatedWaterDepth':
    case 'squatCalculationFairwayWidth':
    case 'squatCalculationSlopeScale':
    case 'squatCalculationSlopeHeight':
    case 'squatTargetFairwayIds':
    case 'squatSuitableFairwayAreaIds':
      newState = squatCalculationReducer(state, value, actionType, actionLang, actionTarget);
      squatCalculationValidator(newState, actionType, validationErrors, setValidationErrors, actionTarget);
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }

  return newState;
};

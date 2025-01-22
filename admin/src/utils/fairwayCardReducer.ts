import { t } from 'i18next';
import { FairwayCardInput, Operation } from '../graphql/generated';
import { ActionType, ErrorMessageKeys, Lang, ValidationType, ValueType } from './constants';
import { dateError, endDateError } from './common';
import { squatCalculationReducer } from './fairwayCardReducers/squatCalculationReducer';
import { fairwayCardSquatCalculationValidator } from './fairwayCardReducers/squatCalculationValidator';
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

export const fairwayCardReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number,
  reservedIds?: string[]
) => {
  // Check manual validations and clear triggered validations by save
  if (actionType === 'primaryId' && state.operation === Operation.Create) {
    let primaryIdErrorMsg = '';
    if (reservedIds?.includes(value as string)) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
    if ((value as string).length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    setValidationErrors(validationErrors.filter((error) => error.id !== 'primaryId').concat({ id: 'primaryId', msg: primaryIdErrorMsg }));
  } else if (actionType === 'name' && validationErrors.find((error) => error.id === 'name')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'name')
        .concat({ id: 'name', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'fairwayIds' && validationErrors.find((error) => error.id === 'fairwayIds')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'fairwayIds')
        .concat({ id: 'fairwayIds', msg: (value as number[]).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'fairwayPrimary' && validationErrors.find((error) => error.id === 'fairwayPrimary')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'fairwayPrimary')
        .concat({ id: 'fairwayPrimary', msg: (value as number[]).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'fairwaySecondary' && validationErrors.find((error) => error.id === 'fairwaySecondary')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'fairwaySecondary')
        .concat({ id: 'fairwaySecondary', msg: (value as number[]).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'group' && validationErrors.find((error) => error.id === 'group')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'group')
        .concat({ id: 'group', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'vtsName' && validationErrors.find((error) => error.id === 'vtsName')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vtsName')
        .concat({ id: 'vtsName', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'tugName' && validationErrors.find((error) => error.id === 'tugName')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'tugName')
        .concat({ id: 'tugName', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  }

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
      newState = generalInfoReducer(state, value, actionType, actionLang, actionTarget);
      break;
    case 'line':
    case 'speedLimit':
    case 'designSpeed':
    case 'anchorage':
      newState = fairwayInfoReducer(state, value, actionType, actionLang, actionTarget, actionOuterTarget);
      break;
    case 'navigationCondition':
    case 'iceCondition':
      newState = navigationReducer(state, value, actionType, actionLang, actionTarget, actionOuterTarget);
      break;
    case 'windRecommendation':
    case 'vesselRecommendation':
    case 'visibility':
    case 'mareographs':
      newState = recommendationsReducer(state, value, actionType, actionLang, actionTarget);
      break;
    case 'pilotEmail':
    case 'pilotPhone':
    case 'pilotFax':
    case 'pilotExtraInfo':
    case 'pilotPlaces':
    case 'pilotJourney':
      newState = pilotOrderReducer(state, value, actionType, actionLang, actionTarget);
      break;
    case 'vts':
    case 'vtsName':
    case 'vtsEmail':
    case 'vtsPhone':
      newState = vtsReducer(state, value, actionType, actionLang, actionTarget, actionOuterTarget);
      break;
    case 'vhf':
    case 'vhfName':
    case 'vhfChannel':
      newState = vhfReducer(state, value, actionType, actionLang, actionTarget, actionOuterTarget);
      break;
    case 'tug':
    case 'tugName':
    case 'tugEmail':
    case 'tugPhone':
    case 'tugFax':
      newState = tugReducer(state, value, actionType, actionLang, actionTarget);
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
      fairwayCardSquatCalculationValidator(newState, actionType, validationErrors, setValidationErrors, actionTarget);
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }

  // More manual validations for text row inputs
  if (actionType === 'line' && validationErrors.find((error) => error.id === 'line')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'line')
        .concat({
          id: 'line',
          msg:
            newState.lineText?.fi.trim() || newState.lineText?.sv.trim() || newState.lineText?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (actionType === 'designSpeed' && validationErrors.find((error) => error.id === 'designSpeed')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'designSpeed')
        .concat({
          id: 'designSpeed',
          msg:
            newState.designSpeed?.fi.trim() || newState.designSpeed?.sv.trim() || newState.designSpeed?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'speedLimit' && validationErrors.find((error) => error.id === 'speedLimit')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'speedLimit')
        .concat({
          id: 'speedLimit',
          msg:
            newState.speedLimit?.fi.trim() || newState.speedLimit?.sv.trim() || newState.speedLimit?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'anchorage' && validationErrors.find((error) => error.id === 'anchorage')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'anchorage')
        .concat({
          id: 'anchorage',
          msg:
            newState.anchorage?.fi.trim() || newState.anchorage?.sv.trim() || newState.anchorage?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'navigationCondition' && validationErrors.find((error) => error.id === 'navigationCondition')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'navigationCondition')
        .concat({
          id: 'navigationCondition',
          msg:
            newState.navigationCondition?.fi.trim() || newState.navigationCondition?.sv.trim() || newState.navigationCondition?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'iceCondition' && validationErrors.find((error) => error.id === 'iceCondition')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'iceCondition')
        .concat({
          id: 'iceCondition',
          msg:
            newState.iceCondition?.fi.trim() || newState.iceCondition?.sv.trim() || newState.iceCondition?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'windRecommendation' && validationErrors.find((error) => error.id === 'windRecommendation')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'windRecommendation')
        .concat({
          id: 'windRecommendation',
          msg:
            newState.windRecommendation?.fi.trim() || newState.windRecommendation?.sv.trim() || newState.windRecommendation?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'vesselRecommendation' && validationErrors.find((error) => error.id === 'vesselRecommendation')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vesselRecommendation')
        .concat({
          id: 'vesselRecommendation',
          msg:
            newState.vesselRecommendation?.fi.trim() || newState.vesselRecommendation?.sv.trim() || newState.vesselRecommendation?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'visibility' && validationErrors.find((error) => error.id === 'visibility')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'visibility')
        .concat({
          id: 'visibility',
          msg:
            newState.visibility?.fi.trim() || newState.visibility?.sv.trim() || newState.visibility?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'pilotExtraInfo' && validationErrors.find((error) => error.id === 'pilotExtraInfo')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'pilotExtraInfo')
        .concat({
          id: 'pilotExtraInfo',
          msg:
            newState.trafficService?.pilot?.extraInfo?.fi.trim() ||
            newState.trafficService?.pilot?.extraInfo?.sv.trim() ||
            newState.trafficService?.pilot?.extraInfo?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'vts' && actionTarget !== undefined) {
    const vtsFieldErrors: ValidationType[] = [];
    validationErrors
      .filter((error) => error.id.startsWith('vtsName-') || error.id.startsWith('vhfName-') || error.id.startsWith('vhfChannel-'))
      .forEach((error) => {
        const errorSplitted = error.id.split('-');
        if (errorSplitted[1] < actionTarget) vtsFieldErrors.push(error);
        if (errorSplitted[1] > actionTarget) {
          vtsFieldErrors.push({
            id: errorSplitted[0] + '-' + (Number(errorSplitted[1]) - 1) + (errorSplitted[2] !== undefined ? '-' + errorSplitted[2] : ''),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors
        .filter((error) => !error.id.startsWith('vtsName-') && !error.id.startsWith('vhfName-') && !error.id.startsWith('vhfChannel-'))
        .concat(vtsFieldErrors)
    );
  } else if (
    actionType === 'vtsName' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'vtsName-' + actionTarget)?.msg
  ) {
    const currentVts = newState.trafficService?.vts?.find((vtsItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vtsName-' + actionTarget)
        .concat({
          id: 'vtsName-' + actionTarget,
          msg: currentVts?.name?.fi.trim() || currentVts?.name?.sv.trim() || currentVts?.name?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (actionType === 'vhf' && actionTarget !== undefined && actionOuterTarget !== undefined) {
    const sectionFieldErrors: ValidationType[] = [];
    validationErrors
      .filter((error) => error.id.startsWith('vhfName-' + actionOuterTarget + '-') || error.id.startsWith('vhfChannel-' + actionOuterTarget + '-'))
      .forEach((error) => {
        const errorSplitted = error.id.split('-' + actionOuterTarget + '-');
        if (errorSplitted[1] < actionTarget) sectionFieldErrors.push(error);
        if (errorSplitted[1] > actionTarget) {
          sectionFieldErrors.push({
            id: errorSplitted[0] + '-' + actionOuterTarget + '-' + (Number(errorSplitted[1]) - 1),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors
        .filter(
          (error) => !error.id.startsWith('vhfName-' + actionOuterTarget + '-') && !error.id.startsWith('vhfChannel-' + actionOuterTarget + '-')
        )
        .concat(sectionFieldErrors)
    );
  } else if (
    actionType === 'vhfName' &&
    actionTarget !== undefined &&
    actionOuterTarget !== undefined &&
    validationErrors.find((error) => error.id === 'vhfName-' + actionOuterTarget + '-' + actionTarget)?.msg
  ) {
    const currentVts = newState.trafficService?.vts?.find((vtsItem, idx) => idx === actionOuterTarget);
    const currentVhf = currentVts?.vhf?.find((vhfItem, jdx) => jdx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vhfName-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'vhfName-' + actionOuterTarget + '-' + actionTarget,
          msg: currentVhf?.name?.fi.trim() || currentVhf?.name?.sv.trim() || currentVhf?.name?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'vhfChannel' &&
    actionTarget !== undefined &&
    actionOuterTarget !== undefined &&
    validationErrors.find((error) => error.id === 'vhfChannel-' + actionOuterTarget + '-' + actionTarget)?.msg
  ) {
    const currentVts = newState.trafficService?.vts?.find((vtsItem, idx) => idx === actionOuterTarget);
    const currentVhf = currentVts?.vhf?.find((vhfItem, jdx) => jdx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vhfChannel-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'vhfChannel-' + actionOuterTarget + '-' + actionTarget,
          msg: !currentVhf?.channel ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (actionType === 'tug' && actionTarget !== undefined) {
    const tugFieldErrors: ValidationType[] = [];
    validationErrors
      .filter((error) => error.id.startsWith('tugName-'))
      .forEach((error) => {
        const errorIndex = error.id.split('tugName-')[1];
        if (errorIndex < actionTarget) tugFieldErrors.push(error);
        if (errorIndex > actionTarget) {
          tugFieldErrors.push({
            id: 'tugName-' + (Number(errorIndex) - 1),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(validationErrors.filter((error) => !error.id.startsWith('tugName-')).concat(tugFieldErrors));
  } else if (
    actionType === 'tugName' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'tugName-' + actionTarget)?.msg
  ) {
    const currentTug = newState.trafficService?.tugs?.find((tugItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'tugName-' + actionTarget)
        .concat({
          id: 'tugName-' + actionTarget,
          msg: currentTug?.name?.fi.trim() || currentTug?.name?.sv.trim() || currentTug?.name?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  }

  // manual validations for temporary notifications (errors that shows before trying to save the whole card)
  if (actionType === 'temporaryNotificationStartDate' && actionTarget !== undefined) {
    const notification = newState.temporaryNotifications?.find((_, idx) => idx === actionTarget);
    let errorMsg = '';

    if (!notification?.startDate) {
      errorMsg = t(ErrorMessageKeys?.required);
    } else if (dateError(notification?.startDate)) {
      errorMsg = t(ErrorMessageKeys?.invalid);
    }

    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'temporaryNotificationStartDate-' + actionTarget)
        .concat({
          id: 'temporaryNotificationStartDate-' + actionTarget,
          msg: errorMsg,
        })
    );
  } else if (actionType === 'temporaryNotificationEndDate' && actionTarget !== undefined) {
    const notification = newState.temporaryNotifications?.find((_, idx) => idx === actionTarget);
    let errorMsg = '';

    if (notification?.endDate && dateError(notification?.endDate)) {
      errorMsg = t(ErrorMessageKeys?.invalid);
      // only if there's valid start date check if end date is same/after start date
    } else if (
      notification?.endDate &&
      notification?.startDate &&
      !dateError(notification?.startDate) &&
      endDateError(notification?.startDate ?? '', notification?.endDate ?? '')
    ) {
      errorMsg = t(ErrorMessageKeys?.endDateError);
    }
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'temporaryNotificationEndDate-' + actionTarget)
        .concat({
          id: 'temporaryNotificationEndDate-' + actionTarget,
          msg: errorMsg,
        })
    );
  }

  return newState;
};

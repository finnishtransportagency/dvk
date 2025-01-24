import { t } from 'i18next';
import { HarborInput } from '../graphql/generated';
import { ActionType, ErrorMessageKeys, Lang, ValidationType, ValueType } from './constants';
import { locationError, QuayOrSection } from './formValidations';
import { infoReducer } from './harbourReducers/infoReducer';
import { contactReducer } from './harbourReducers/contactReducer';
import { quayReducer } from './harbourReducers/quayReducer';
import { sectionReducer } from './harbourReducers/sectionReducer';
import { infoValidator } from './harbourValidators/infoValidator';
import { contactValidator } from './harbourValidators/contactValidator';
import { quayValidator } from './harbourValidators/quayValidator';

export const harbourReducer = (
  state: HarborInput,
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
      quayValidator(newState, value, actionType, validationErrors, setValidationErrors, actionTarget);
      break;
    case 'section':
    case 'sectionName':
    case 'sectionDepth':
    case 'sectionLat':
    case 'sectionLon':
      newState = sectionReducer(state, value, actionType, actionTarget, actionOuterTarget);
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }

  if (actionType === 'section' && actionTarget !== undefined && actionOuterTarget !== undefined) {
    const sectionFieldErrors: ValidationType[] = [];
    validationErrors
      .filter((error) => error.id.startsWith('sectionGeometry-' + actionOuterTarget + '-'))
      .forEach((error) => {
        const errorIndex = error.id.split('sectionGeometry-' + actionOuterTarget + '-')[1];
        if (errorIndex < actionTarget) sectionFieldErrors.push(error);
        if (errorIndex > actionTarget) {
          sectionFieldErrors.push({
            id: 'sectionGeometry-' + actionOuterTarget + '-' + (Number(errorIndex) - 1),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors.filter((error) => !error.id.startsWith('sectionGeometry-' + actionOuterTarget + '-')).concat(sectionFieldErrors)
    );
  } else if (
    (actionType === 'sectionLat' || actionType === 'sectionLon') &&
    actionTarget !== undefined &&
    actionOuterTarget !== undefined &&
    validationErrors.find((error) => error.id === 'sectionGeometry-' + actionOuterTarget + '-' + actionTarget)?.msg
  ) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionOuterTarget);
    const currentSection = currentQuay?.sections?.find((sectionItem, jdx) => jdx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'sectionGeometry-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'sectionGeometry-' + actionOuterTarget + '-' + actionTarget,
          msg: currentSection?.geometry?.lat.trim() || currentSection?.geometry?.lon.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if ((actionType === 'sectionLat' || actionType === 'sectionLon') && actionTarget !== undefined && actionOuterTarget !== undefined) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionOuterTarget);
    const currentSection = currentQuay?.sections?.find((sectionItem, jdx) => jdx === actionTarget);
    const target = actionOuterTarget + '-' + actionTarget;
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'sectionLocation-' + actionOuterTarget + '-' + actionTarget)
        .concat({
          id: 'sectionLocation-' + target,
          msg: locationError(
            { actionTarget: target, geometry: currentSection?.geometry } as QuayOrSection,
            newState.quays?.flatMap(
              (q, qIdx) => q?.sections?.map((s, sIdx) => ({ geometry: s?.geometry, actionTarget: qIdx + '-' + sIdx }) as QuayOrSection) ?? []
            )
          )
            ? t(ErrorMessageKeys?.duplicateLocation) || ''
            : '',
        })
    );
  }

  return newState;
};

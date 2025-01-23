import { t } from 'i18next';
import { HarborInput, Operation, Status } from '../graphql/generated';
import { ActionType, ErrorMessageKeys, Lang, ValidationType, ValueType } from './constants';
import { locationError, QuayOrSection } from './formValidations';
import { infoReducer } from './harbourReducers/infoReducer';
import { contactReducer } from './harbourReducers/contactReducer';
import { quayReducer } from './harbourReducers/quayReducer';
import { sectionReducer } from './harbourReducers/sectionReducer';

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
  if (actionType === 'primaryId' && state.operation === Operation.Create) {
    let primaryIdErrorMsg = '';
    if (reservedIds?.includes(value as string)) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
    if ((value as string).length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    setValidationErrors(validationErrors.filter((error) => error.id !== 'primaryId').concat({ id: 'primaryId', msg: primaryIdErrorMsg }));
  } else if (actionType === 'name' && validationErrors.find((error) => error.id === 'name')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'name')
        .concat({ id: 'name', msg: value === null || (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'lat' && validationErrors.find((error) => error.id === 'lat')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'lat')
        .concat({ id: 'lat', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  } else if (actionType === 'lon' && validationErrors.find((error) => error.id === 'lon')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'lon')
        .concat({ id: 'lon', msg: (value as string).length < 1 ? t(ErrorMessageKeys?.required) || '' : '' })
    );
  }

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
      newState = infoReducer(state, value, actionType, actionLang, actionTarget);
      break;
    case 'companyName':
    case 'email':
    case 'phoneNumber':
    case 'fax':
    case 'internet':
    case 'lat':
    case 'lon':
      newState = contactReducer(state, value, actionType, actionLang, actionTarget);
      break;
    case 'quay':
    case 'quayName':
    case 'quayLength':
    case 'quayLat':
    case 'quayLon':
    case 'quayExtraInfo':
      newState = quayReducer(state, value, actionType, actionLang, actionTarget);
      break;
    case 'section':
    case 'sectionName':
    case 'sectionDepth':
    case 'sectionLat':
    case 'sectionLon':
      newState = sectionReducer(state, value, actionType, actionLang, actionTarget, actionOuterTarget);
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }

  // More manual validations for text row inputs
  if (actionType === 'extraInfo' && validationErrors.find((error) => error.id === 'extraInfo')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'extraInfo')
        .concat({
          id: 'extraInfo',
          msg:
            newState.extraInfo?.fi.trim() || newState.extraInfo?.sv.trim() || newState.extraInfo?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'cargo' && validationErrors.find((error) => error.id === 'cargo')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'cargo')
        .concat({
          id: 'cargo',
          msg: newState.cargo?.fi.trim() || newState.cargo?.sv.trim() || newState.cargo?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (actionType === 'harbourBasin' && validationErrors.find((error) => error.id === 'harbourBasin')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'harbourBasin')
        .concat({
          id: 'harbourBasin',
          msg:
            newState.harborBasin?.fi.trim() || newState.harborBasin?.sv.trim() || newState.harborBasin?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (actionType === 'companyName' && validationErrors.find((error) => error.id === 'companyName')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'companyName')
        .concat({
          id: 'companyName',
          msg: newState.company?.fi.trim() || newState.company?.sv.trim() || newState.company?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (actionType === 'quay' && actionTarget !== undefined) {
    const quayFieldErrors: ValidationType[] = [];
    validationErrors
      .filter(
        (error) =>
          error.id.startsWith('quayName-') ||
          error.id.startsWith('quayExtraInfo-') ||
          error.id.startsWith('quayLat-') ||
          error.id.startsWith('quayLon-') ||
          error.id.startsWith('sectionGeometry-') ||
          error.id.startsWith('quayLocation-') ||
          error.id.startsWith('sectionLocation-')
      )
      .forEach((error) => {
        const errorSplitted = error.id.split('-');
        if (errorSplitted[1] < actionTarget) quayFieldErrors.push(error);
        if (errorSplitted[1] > actionTarget) {
          quayFieldErrors.push({
            id: errorSplitted[0] + '-' + (Number(errorSplitted[1]) - 1) + (errorSplitted[2] !== undefined ? '-' + errorSplitted[2] : ''),
            msg: error.msg,
          });
        }
        return error;
      });
    setValidationErrors(
      validationErrors
        .filter(
          (error) =>
            !error.id.startsWith('quayName-') &&
            !error.id.startsWith('quayExtraInfo-') &&
            !error.id.startsWith('quayLat-') &&
            !error.id.startsWith('quayLon-') &&
            !error.id.startsWith('sectionGeometry-') &&
            !error.id.startsWith('quayLocation-') &&
            !error.id.startsWith('sectionLocation-')
        )
        .concat(quayFieldErrors)
    );
  } else if (
    actionType === 'quayName' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'quayName-' + actionTarget)?.msg
  ) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'quayName-' + actionTarget)
        .concat({
          id: 'quayName-' + actionTarget,
          msg:
            currentQuay?.name?.fi.trim() || currentQuay?.name?.sv.trim() || currentQuay?.name?.en.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'quayExtraInfo' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'quayExtraInfo-' + actionTarget)?.msg
  ) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'quayExtraInfo-' + actionTarget)
        .concat({
          id: 'quayExtraInfo-' + actionTarget,
          msg:
            currentQuay?.extraInfo?.fi.trim() || currentQuay?.extraInfo?.sv.trim() || currentQuay?.extraInfo?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (
    actionType === 'quayLat' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'quayLat-' + actionTarget)?.msg
  ) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'quayLat-' + actionTarget)
        .concat({
          id: 'quayLat-' + actionTarget,
          msg: !currentQuay?.geometry?.lat?.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'quayLon' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'quayLon-' + actionTarget)?.msg
  ) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'quayLon-' + actionTarget)
        .concat({
          id: 'quayLon-' + actionTarget,
          msg: !currentQuay?.geometry?.lon?.trim() ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if ((actionType === 'quayLat' || actionType === 'quayLon') && actionTarget !== undefined) {
    const currentQuay = newState.quays?.find((quayItem, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'quayLocation-' + actionTarget)
        .concat({
          id: 'quayLocation-' + actionTarget,
          msg: locationError(
            { actionTarget: String(actionTarget), geometry: currentQuay?.geometry } as QuayOrSection,
            newState.quays?.map((q, i) => ({ geometry: q?.geometry, actionTarget: String(i) }) as QuayOrSection)
          )
            ? t(ErrorMessageKeys?.duplicateLocation) || ''
            : '',
        })
    );
  } else if (actionType === 'section' && actionTarget !== undefined && actionOuterTarget !== undefined) {
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

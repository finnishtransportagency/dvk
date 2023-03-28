import { HarborInput, Operation, Status } from '../graphql/generated';
import { ActionType, ErrorMessageType, Lang, ValidationType, ValueType } from './constants';

export const harbourReducer = (
  state: HarborInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number,
  errorMessages?: ErrorMessageType,
  reservedIds?: string[]
) => {
  console.log('updateState... for input ' + actionType, actionLang, value);
  // Check manual validations and clear triggered validations by save
  if (actionType === 'primaryId' && state.operation === Operation.Create) {
    let primaryIdErrorMsg = '';
    if (reservedIds?.includes(value as string)) primaryIdErrorMsg = errorMessages?.duplicateId || '';
    if ((value as string).length < 1) primaryIdErrorMsg = errorMessages?.required || '';
    setValidationErrors(validationErrors.filter((error) => error.id !== 'primaryId').concat({ id: 'primaryId', msg: primaryIdErrorMsg }));
  } else if (actionType === 'name' && validationErrors.find((error) => error.id === 'name')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'name')
        .concat({ id: 'name', msg: (value as string).length < 1 ? errorMessages?.required || '' : '' })
    );
  } else if (actionType === 'lat' && validationErrors.find((error) => error.id === 'lat')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'lat')
        .concat({ id: 'lat', msg: (value as string).length < 1 ? errorMessages?.required || '' : '' })
    );
  } else if (actionType === 'lon' && validationErrors.find((error) => error.id === 'lon')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'lon')
        .concat({ id: 'lon', msg: (value as string).length < 1 ? errorMessages?.required || '' : '' })
    );
  }

  let newState;
  switch (actionType) {
    case 'primaryId':
      newState = { ...state, id: value as string };
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
          ...(state.extraInfo || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'cargo':
      if (!actionLang) return state;
      newState = {
        ...state,
        cargo: {
          ...(state.cargo || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'harbourBasin':
      if (!actionLang) return state;
      newState = {
        ...state,
        harborBasin: {
          ...(state.harborBasin || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'companyName':
      if (!actionLang) return state;
      newState = {
        ...state,
        company: {
          ...(state.company || { fi: '', sv: '', en: '' }),
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
      newState = { ...state, geometry: { lat: value as number, lon: state.geometry.lon } };
      break;
    case 'lon':
      newState = { ...state, geometry: { lat: state.geometry.lat, lon: value as number } };
      break;
    case 'quay':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          quays: state.quays?.concat([
            {
              name: { fi: '', sv: '', en: '' },
              length: undefined,
              geometry: undefined,
            },
          ]),
        };
      } else {
        newState = {
          ...state,
          quays: state.quays?.filter((quayItem, idx) => idx !== actionTarget),
        };
      }
      break;
    case 'quayName':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                name: {
                  ...(quayItem?.name || { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value as string,
                },
              }
            : quayItem
        ),
      };
      break;
    case 'quayLength':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                length: value as number,
              }
            : quayItem
        ),
      };
      break;
    case 'quayLat':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                geometry: { lat: (value as number) || 0, lon: quayItem?.geometry?.lon || 0 },
              }
            : quayItem
        ),
      };
      break;
    case 'quayLon':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                geometry: { lat: quayItem?.geometry?.lat || 0, lon: (value as number) || 0 },
              }
            : quayItem
        ),
      };
      break;
    case 'quayExtraInfo':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionTarget
            ? {
                ...quayItem,
                extraInfo: {
                  ...(quayItem?.extraInfo || { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value as string,
                },
              }
            : quayItem
        ),
      };
      break;
    case 'section':
      // Add and delete
      if (value && actionOuterTarget !== undefined) {
        newState = {
          ...state,
          quays: state.quays?.map((quayItem, i) =>
            i === actionOuterTarget
              ? {
                  ...quayItem,
                  sections: (quayItem?.sections || []).concat([{ name: '', depth: undefined, geometry: undefined }]),
                }
              : quayItem
          ),
        };
      } else if (!value && actionTarget !== undefined) {
        newState = {
          ...state,
          quays: state.quays?.map((quayItem) => {
            return {
              ...quayItem,
              sections: quayItem?.sections?.filter((sectionItem, idx) => idx !== actionTarget),
            };
          }),
        };
      } else {
        return state;
      }
      break;
    case 'sectionName':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        name: value as string,
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    case 'sectionDepth':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        depth: value as number,
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    case 'sectionLat':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        geometry: { lat: (value as number) || 0, lon: sectionItem?.geometry?.lon || 0 },
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    case 'sectionLon':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        geometry: { lat: sectionItem?.geometry?.lat || 0, lon: (value as number) || 0 },
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    case 'status':
      newState = { ...state, status: value as Status };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

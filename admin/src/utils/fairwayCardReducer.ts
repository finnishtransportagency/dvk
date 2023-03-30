import { FairwayCardInput, Operation, PilotPlace, Status } from '../graphql/generated';
import { ActionType, ErrorMessageType, Lang, ValidationType, ValueType } from './constants';

export const fairwayCardReducer = (
  state: FairwayCardInput,
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
  console.log('updateState... for input ' + actionType, actionLang);
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
  } else if (actionType === 'fairwayIds' && validationErrors.find((error) => error.id === 'fairwayIds')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'fairwayIds')
        .concat({ id: 'fairwayIds', msg: (value as number[]).length < 1 ? errorMessages?.required || '' : '' })
    );
  } else if (actionType === 'group' && validationErrors.find((error) => error.id === 'group')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'group')
        .concat({ id: 'group', msg: (value as string).length < 1 ? errorMessages?.required || '' : '' })
    );
  } else if (actionType === 'vtsName' && validationErrors.find((error) => error.id === 'vtsName')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'vtsName')
        .concat({ id: 'vtsName', msg: (value as string).length < 1 ? errorMessages?.required || '' : '' })
    );
  } else if (actionType === 'tugName' && validationErrors.find((error) => error.id === 'tugName')?.msg) {
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'tugName')
        .concat({ id: 'tugName', msg: (value as string).length < 1 ? errorMessages?.required || '' : '' })
    );
  }

  let newState;
  switch (actionType) {
    case 'name':
      if (!actionLang) return state;
      newState = { ...state, name: { ...state.name, [actionLang as string]: value as string } };
      break;
    case 'primaryId':
      newState = { ...state, id: value as string };
      break;
    case 'status':
      newState = { ...state, status: value as Status };
      break;
    case 'fairwayIds':
      newState = {
        ...state,
        fairwayIds: value as number[],
      };
      if (!(value as number[]).includes(state.primaryFairwayId || -1)) delete newState.primaryFairwayId;
      if (!(value as number[]).includes(state.secondaryFairwayId || -1)) delete newState.secondaryFairwayId;
      if ((value as number[]).length === 1) {
        newState.primaryFairwayId = (value as number[])[0];
        newState.secondaryFairwayId = (value as number[])[0];
      }
      break;
    case 'fairwayPrimary':
      newState = { ...state, primaryFairwayId: Number(value) };
      break;
    case 'fairwaySecondary':
      newState = { ...state, secondaryFairwayId: Number(value) };
      break;
    case 'harbours':
      newState = { ...state, harbors: value as string[] };
      break;
    case 'referenceLevel':
      newState = { ...state, n2000HeightSystem: !!value };
      break;
    case 'group':
      newState = { ...state, group: value as string };
      break;
    case 'line':
      if (!actionLang) return state;
      newState = {
        ...state,
        lineText: {
          ...(state.lineText || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'speedLimit':
      if (!actionLang) return state;
      newState = {
        ...state,
        speedLimit: {
          ...(state.speedLimit || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'designSpeed':
      if (!actionLang) return state;
      newState = {
        ...state,
        designSpeed: {
          ...(state.designSpeed || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'anchorage':
      if (!actionLang) return state;
      newState = {
        ...state,
        anchorage: {
          ...(state.anchorage || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'navigationCondition':
      if (!actionLang) return state;
      newState = {
        ...state,
        navigationCondition: {
          ...(state.navigationCondition || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'iceCondition':
      if (!actionLang) return state;
      newState = {
        ...state,
        iceCondition: {
          ...(state.iceCondition || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'windRecommendation':
      if (!actionLang) return state;
      newState = {
        ...state,
        windRecommendation: {
          ...(state.windRecommendation || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'vesselRecommendation':
      if (!actionLang) return state;
      newState = {
        ...state,
        vesselRecommendation: {
          ...(state.vesselRecommendation || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'visibility':
      if (!actionLang) return state;
      newState = {
        ...state,
        visibility: {
          ...(state.visibility || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'windGauge':
      if (!actionLang) return state;
      newState = {
        ...state,
        windGauge: {
          ...(state.windGauge || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'seaLevel':
      if (!actionLang) return state;
      newState = {
        ...state,
        seaLevel: {
          ...(state.seaLevel || { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'pilotEmail':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          pilot: {
            ...state.trafficService?.pilot,
            email: value as string,
          },
        },
      };
      break;
    case 'pilotPhone':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          pilot: {
            ...state.trafficService?.pilot,
            phoneNumber: value as string,
          },
        },
      };
      break;
    case 'pilotFax':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          pilot: {
            ...state.trafficService?.pilot,
            fax: value as string,
          },
        },
      };
      break;
    case 'pilotExtraInfo':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          pilot: {
            ...state.trafficService?.pilot,
            extraInfo: {
              ...(state.trafficService?.pilot?.extraInfo || { fi: '', sv: '', en: '' }),
              [actionLang as string]: value as string,
            },
          },
        },
      };
      break;
    case 'pilotPlaces':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          pilot: {
            ...state.trafficService?.pilot,
            places: value as PilotPlace[],
          },
        },
      };
      break;
    case 'pilotJourney':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          pilot: {
            ...state.trafficService?.pilot,
            places: state.trafficService?.pilot?.places?.map((place) =>
              place.id === actionTarget ? { ...place, pilotJourney: value as number } : place
            ),
          },
        },
      };
      break;
    case 'vts':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.concat([
              {
                email: [],
                name: { fi: '', sv: '', en: '' },
                phoneNumber: '',
                vhf: [],
              },
            ]),
          },
        };
      } else {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.filter((vtsItem, idx) => idx !== actionTarget),
          },
        };
      }
      break;
    case 'vtsName':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionTarget
              ? {
                  ...vtsItem,
                  name: {
                    ...(vtsItem?.name || { fi: '', sv: '', en: '' }),
                    [actionLang as string]: value as string,
                  },
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'vtsEmail':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name || { fi: '', sv: '', en: '' },
                  email: (value as string).split(',').map((item) => item.trim()),
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'vtsPhone':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name || { fi: '', sv: '', en: '' },
                  phoneNumber: ((value as string) || '').trim(),
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'vhf':
      // Add and delete
      if (value && actionOuterTarget !== undefined) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, i) =>
              i === actionOuterTarget
                ? {
                    ...vtsItem,
                    name: vtsItem?.name || { fi: '', sv: '', en: '' },
                    vhf: vtsItem?.vhf?.concat([{ channel: 0, name: { fi: '', sv: '', en: '' } }]),
                  }
                : vtsItem
            ),
          },
        };
      } else if (!value && actionTarget !== undefined) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem) => {
              return {
                ...vtsItem,
                name: vtsItem?.name || { fi: '', sv: '', en: '' },
                vhf: vtsItem?.vhf?.filter((vhfItem, idx) => idx !== actionTarget),
              };
            }),
          },
        };
      } else {
        return state;
      }
      break;
    case 'vhfName':
      if (actionTarget === undefined || actionOuterTarget === undefined) return state;
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionOuterTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name || { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                    j === actionTarget
                      ? {
                          name: {
                            ...(vhfItem?.name || { fi: '', sv: '', en: '' }),
                            [actionLang as string]: value as string,
                          },
                          channel: vhfItem?.channel || 0,
                        }
                      : vhfItem
                  ),
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'vhfChannel':
      if (actionTarget === undefined || actionOuterTarget === undefined) return state;
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vts: state.trafficService?.vts?.map((vtsItem, idx) =>
            idx === actionOuterTarget
              ? {
                  ...vtsItem,
                  name: vtsItem?.name || { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                    j === actionTarget
                      ? {
                          name: vhfItem?.name || { fi: '', sv: '', en: '' },
                          channel: value as number,
                        }
                      : vhfItem
                  ),
                }
              : vtsItem
          ),
        },
      };
      break;
    case 'tug':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.concat([
              {
                email: '',
                name: { fi: '', sv: '', en: '' },
                phoneNumber: [],
                fax: '',
              },
            ]),
          },
        };
      } else {
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.filter((tugItem, idx) => idx !== actionTarget),
          },
        };
      }
      break;
    case 'tugName':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: {
                    ...(tugItem?.name || { fi: '', sv: '', en: '' }),
                    [actionLang as string]: value as string,
                  },
                }
              : tugItem
          ),
        },
      };
      break;
    case 'tugEmail':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: tugItem?.name || { fi: '', sv: '', en: '' },
                  email: ((value as string) || '').trim(),
                }
              : tugItem
          ),
        },
      };
      break;
    case 'tugPhone':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: tugItem?.name || { fi: '', sv: '', en: '' },
                  phoneNumber: (value as string).split(',').map((item) => item.trim()),
                }
              : tugItem
          ),
        },
      };
      break;
    case 'tugFax':
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
            idx === actionTarget
              ? {
                  ...tugItem,
                  name: tugItem?.name || { fi: '', sv: '', en: '' },
                  fax: ((value as string) || '').trim(),
                }
              : tugItem
          ),
        },
      };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

import { t } from 'i18next';
import { FairwayCardInput, Operation, PictureInput, PilotPlaceInput, Status } from '../graphql/generated';
import { ActionType, ErrorMessageKeys, Lang, ValidationType, ValueType } from './constants';
import { dateError, endDateError, sortPictures } from './common';

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
      if (!actionLang) return state;
      newState = { ...state, name: { ...state.name, [actionLang as string]: value as string } };
      break;
    case 'primaryId':
      newState = { ...state, id: (value as string).toLowerCase() };
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
    case 'pilotRoutes':
      newState = { ...state, pilotRoutes: value as number[] };
      break;
    case 'referenceLevel':
      newState = { ...state, n2000HeightSystem: !!value, harbors: [] };
      break;
    case 'group':
      newState = { ...state, group: value as string };
      break;
    case 'additionalInfo':
      if (!actionLang) return state;
      newState = {
        ...state,
        additionalInfo: {
          ...(state.additionalInfo ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'line':
      if (!actionLang) return state;
      newState = {
        ...state,
        lineText: {
          ...(state.lineText ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'speedLimit':
      if (!actionLang) return state;
      newState = {
        ...state,
        speedLimit: {
          ...(state.speedLimit ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'designSpeed':
      if (!actionLang) return state;
      newState = {
        ...state,
        designSpeed: {
          ...(state.designSpeed ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'anchorage':
      if (!actionLang) return state;
      newState = {
        ...state,
        anchorage: {
          ...(state.anchorage ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'navigationCondition':
      if (!actionLang) return state;
      newState = {
        ...state,
        navigationCondition: {
          ...(state.navigationCondition ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
    case 'iceCondition':
      if (!actionLang) return state;
      newState = {
        ...state,
        iceCondition: {
          ...(state.iceCondition ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;
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
              ...(state.trafficService?.pilot?.extraInfo ?? { fi: '', sv: '', en: '' }),
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
            // check if one of the values is already in state and if found, attach it's pilotjourney value to the new value
            places: (value as PilotPlaceInput[]).map((place) => {
              const oldPlace = state.trafficService?.pilot?.places?.find((op) => op.id === place.id);
              return oldPlace ? { ...place, ...oldPlace } : place;
            }),
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
              place.id === actionTarget ? { ...place, pilotJourney: value as string } : place
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
                    ...(vtsItem?.name ?? { fi: '', sv: '', en: '' }),
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
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
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
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
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
                    name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                    vhf: vtsItem?.vhf?.concat([{ channel: '', name: { fi: '', sv: '', en: '' } }]),
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
            vts: state.trafficService?.vts?.map((vtsItem, i) => {
              if (i === actionOuterTarget) {
                return {
                  ...vtsItem,
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.filter((vhfItem, idx) => idx !== actionTarget),
                };
              } else {
                return { ...vtsItem, name: vtsItem?.name ?? { fi: '', sv: '', en: '' } };
              }
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
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                    j === actionTarget
                      ? {
                          name: {
                            ...(vhfItem?.name ?? { fi: '', sv: '', en: '' }),
                            [actionLang as string]: value as string,
                          },
                          channel: vhfItem?.channel?.toString() ?? '',
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
                  name: vtsItem?.name ?? { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                    j === actionTarget
                      ? {
                          name: vhfItem?.name ?? { fi: '', sv: '', en: '' },
                          channel: value as string,
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
                    ...(tugItem?.name ?? { fi: '', sv: '', en: '' }),
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
                  name: tugItem?.name ?? { fi: '', sv: '', en: '' },
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
                  name: tugItem?.name ?? { fi: '', sv: '', en: '' },
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
                  name: tugItem?.name ?? { fi: '', sv: '', en: '' },
                  fax: ((value as string) || '').trim(),
                }
              : tugItem
          ),
        },
      };
      break;
    case 'picture':
      newState = {
        ...state,
        pictures: sortPictures(value as PictureInput[]),
      };
      break;
    case 'pictureDescription':
      newState = {
        ...state,
        pictures: state.pictures?.map((pic) => (pic.groupId === actionTarget && pic.lang === actionLang ? { ...pic, text: value as string } : pic)),
      };
      break;
    case 'pictureLegendPosition':
      newState = {
        ...state,
        pictures: state.pictures?.map((pic) => (pic.groupId === actionTarget ? { ...pic, legendPosition: value as string } : pic)),
      };
      break;
    case 'temporaryNotifications':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          temporaryNotifications: state.temporaryNotifications?.concat({
            content: { fi: '', sv: '', en: '' },
            startDate: '',
            endDate: '',
          }),
        };
      } else {
        newState = {
          ...state,
          temporaryNotifications: state.temporaryNotifications?.filter((_, idx) => idx !== actionTarget),
        };
      }
      break;
    case 'temporaryNotificationContent':
      newState = {
        ...state,
        temporaryNotifications: state.temporaryNotifications?.map((notification, idx) =>
          idx === actionTarget
            ? {
                ...notification,
                content: {
                  ...(notification?.content ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value as string,
                },
              }
            : notification
        ),
      };
      break;
    case 'temporaryNotificationStartDate':
      newState = {
        ...state,
        temporaryNotifications: state.temporaryNotifications?.map((notification, idx) =>
          idx === actionTarget ? { ...notification, startDate: value as string } : notification
        ),
      };
      break;
    case 'temporaryNotificationEndDate':
      newState = {
        ...state,
        temporaryNotifications: state.temporaryNotifications?.map((notification, idx) =>
          idx === actionTarget ? { ...notification, endDate: value as string } : notification
        ),
      };
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
    // } else if (actionType === 'windGauge' && validationErrors.find((error) => error.id === 'windGauge')?.msg) {
    //   setValidationErrors(
    //     validationErrors
    //       .filter((error) => error.id !== 'windGauge')
    //       .concat({
    //         id: 'windGauge',
    //         msg:
    //           newState.windGauge?.fi.trim() || newState.windGauge?.sv.trim() || newState.windGauge?.en.trim()
    //             ? t(ErrorMessageKeys?.required) || ''
    //             : '',
    //       })
    //   );
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

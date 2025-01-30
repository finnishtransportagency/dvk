import { FairwayCardInput, PilotPlaceInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const pilotOrderReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
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
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

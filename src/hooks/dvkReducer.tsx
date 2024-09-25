import { APP_CONFIG_PREVIEW, UserLocationPermission } from '../utils/constants';

// Set up reducer and state properties
export type State = {
  isOffline: boolean;
  modalBreakpoint: number;
  layers: string[];
  showAisPredictor: boolean;
  response: string[];
  locationPermission: UserLocationPermission;
  preview: boolean;
  harborId: string;
  version: string;
};

// Set initial state
export const initialState: State = {
  isOffline: false,
  modalBreakpoint: 0.5,
  layers: ['pilot', 'line12', 'harbor', 'name', 'quay'],
  showAisPredictor: false,
  response: [],
  locationPermission: 'off',
  preview: VITE_APP_CONFIG === APP_CONFIG_PREVIEW,
  harborId: '',
  version: '',
};

export type Action =
  | {
      type: 'setOffline' | 'setBreakpoint';
      payload: {
        value: boolean | number;
      };
    }
  | {
      type: 'setLayers';
      payload: {
        value: string[];
      };
    }
  | {
      type: 'setShowAisPredictor';
      payload: {
        value: boolean;
      };
    }
  | {
      type: 'setResponse';
      payload: {
        value: string[];
      };
    }
  | {
      type: 'setLocationPermission';
      payload: {
        value: UserLocationPermission;
      };
    }
  | {
      type: 'setPreview';
      payload: {
        value: boolean;
      };
    }
  | {
      type: 'setHarborId';
      payload: {
        value: string;
      };
    }
  | {
      type: 'version';
      payload: {
        value: string;
      };
    }
  | { type: 'reset' };

export const DvkReducer = (state: State, action: Action) => {
  let newState;
  // Return updated state
  switch (action.type) {
    case 'setOffline':
      newState = { ...state, isOffline: !!action.payload.value };
      break;
    case 'setBreakpoint':
      newState = { ...state, modalBreakpoint: Number(action.payload.value) };
      break;
    case 'setLayers':
      newState = { ...state, layers: action.payload.value };
      break;
    case 'setShowAisPredictor':
      newState = { ...state, showAisPredictor: action.payload.value };
      break;
    case 'setResponse':
      newState = { ...state, response: action.payload.value };
      break;
    case 'setLocationPermission':
      newState = { ...state, locationPermission: action.payload.value };
      break;
    case 'setPreview':
      newState = { ...state, preview: action.payload.value };
      break;
    case 'setHarborId':
      newState = { ...state, harborId: action.payload.value };
      break;
    case 'version':
      newState = { ...state, version: action.payload.value };
      break;
    case 'reset':
      return initialState;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

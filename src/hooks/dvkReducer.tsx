import { UserLocationPermission } from '../utils/constants';

// Set up reducer and state properties
export type State = {
  isOffline: boolean;
  modalBreakpoint: number;
  layers: string[];
  showAisPredictor: boolean;
  response: string[];
  locationPermission: UserLocationPermission;
  preview: boolean;
};

// Set initial state
export const initialState: State = {
  isOffline: false,
  modalBreakpoint: 0.5,
  layers: ['pilot', 'line12', 'harbor', 'name', 'quay'],
  showAisPredictor: false,
  response: [],
  locationPermission: 'off',
  preview: false,
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
    case 'reset':
      return initialState;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

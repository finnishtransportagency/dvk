import { UserLocationPermission } from '../utils/constants';

// Set up reducer and state properties
export type State = {
  isOffline: boolean;
  modalBreakpoint: number;
  layers: string[];
  response: string[];
  locationPermission: UserLocationPermission;
};

// Set initial state
export const initialState: State = {
  isOffline: false,
  modalBreakpoint: 0.5,
  layers: ['pilot', 'line12', 'harbor', 'name', 'quay'],
  response: [],
  locationPermission: 'off',
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
    case 'setResponse':
      newState = { ...state, response: action.payload.value };
      break;
    case 'setLocationPermission':
      newState = { ...state, locationPermission: action.payload.value };
      break;
    case 'reset':
      return initialState;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

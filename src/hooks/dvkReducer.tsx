// Set up reducer and state properties
export type State = {
  isOffline: boolean;
  modalBreakpoint: number;
  layers: string[];
  locationPermission: boolean;
};

// Set initial state
export const initialState: State = {
  isOffline: false,
  modalBreakpoint: 0.5,
  layers: ['pilot', 'line12', 'harbor', 'name'],
  locationPermission: false,
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
      type: 'setLocationPermission';
      payload: {
        value: boolean;
      };
    }
  | { type: 'reset' };

export const DvkReducer = (state: State, action: Action) => {
  // Sort out correct value type from input element
  let inputValue: boolean | number | string[] = false;
  if (action.type !== 'reset') {
    inputValue = action.payload.value;
  }
  let newState;
  // Return updated state
  switch (action.type) {
    case 'setOffline':
      newState = { ...state, isOffline: !!inputValue };
      break;
    case 'setBreakpoint':
      newState = { ...state, modalBreakpoint: Number(inputValue) };
      break;
    case 'setLayers':
      newState = { ...state, layers: inputValue as string[] };
      break;
    case 'setLocationPermission':
      newState = { ...state, locationPermission: !!inputValue };
      break;
    case 'reset':
      return initialState;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

// Set up reducer and state properties
export type State = {
  isOffline: boolean;
  modalBreakpoint: number;
};

// Set initial state
export const initialState: State = {
  isOffline: false,
  modalBreakpoint: 0.5,
};

export type Action =
  | {
      type: 'setOffline' | 'setBreakpoint';
      payload: {
        value: boolean | number;
      };
    }
  | { type: 'reset' };

export const DvkReducer = (state: State, action: Action) => {
  // Sort out correct value type from input element
  let inputValue: boolean | number = false;
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
    case 'reset':
      return initialState;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

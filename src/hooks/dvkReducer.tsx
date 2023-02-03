// Set up reducer and state properties
export type State = {
  isOffline: boolean;
};

// Set initial state
export const initialState: State = {
  isOffline: false,
};

export type Action =
  | {
      type: 'setOffline';
      payload: {
        value: boolean;
      };
    }
  | { type: 'reset' };

export const DvkReducer = (state: State, action: Action) => {
  // Sort out correct value type from input element
  let inputValue = false;
  if (action.type !== 'reset') {
    inputValue = action.payload.value;
  }
  let newState;
  // Return updated state
  switch (action.type) {
    case 'setOffline':
      newState = { ...state, isOffline: inputValue };
      break;
    case 'reset':
      return initialState;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

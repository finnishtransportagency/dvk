import React, { Dispatch } from 'react';
import { State, Action } from './squatReducer';

interface IContextProps {
  state: State;
  dispatch: Dispatch<Action>;
}

const SquatContext = React.createContext({} as IContextProps);

export function useSquatContext() {
  return React.useContext(SquatContext);
}

export default SquatContext;

import React, { Dispatch } from 'react';
import { State, Action } from './dvkReducer';

interface IContextProps {
  state: State;
  dispatch: Dispatch<Action>;
}

const DvkContext = React.createContext({} as IContextProps);

export function useDvkContext() {
  return React.useContext(DvkContext);
}

export default DvkContext;

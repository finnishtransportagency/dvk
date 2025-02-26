import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, ValueType } from '../constants';

export const vtsReducer = (state: FairwayCardInput, value: ValueType, actionType: ActionType, actionTarget?: string | number): FairwayCardInput => {
  let newState;
  if (actionType === 'vtsIds') {
    if (value && actionTarget === undefined) {
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vtsIds: state.trafficService?.vtsIds?.concat(['']),
        },
      };
    } else if (value && actionTarget !== undefined) {
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vtsIds: state.trafficService?.vtsIds?.map((id, idx) => (idx === actionTarget ? String(value) : id)),
        },
      };
    } else {
      newState = {
        ...state,
        trafficService: {
          ...state.trafficService,
          vtsIds: state.trafficService?.vtsIds?.filter((_, idx) => idx !== actionTarget),
        },
      };
    }
  } else {
    console.warn('Unknown action type, state not updated.');
    return state;
  }
  return newState;
};

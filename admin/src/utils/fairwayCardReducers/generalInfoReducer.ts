import { FairwayCardInput, SelectedFairwayInput, Status } from '../../graphql/generated';
import { removeSequence } from '../common';
import { ActionType, Lang, ValueType } from '../constants';

export const generalInfoReducer = (state: FairwayCardInput, value: ValueType, actionType: ActionType, actionLang?: Lang): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'name':
      if (!actionLang) return state;
      newState = { ...state, name: { ...state.name, [actionLang as string]: value as string } };
      break;
    case 'primaryId':
      newState = { ...state, id: (value as string).toLowerCase() };
      break;
    case 'status':
      newState = { ...state, status: value as Status };
      break;
    case 'fairwayIds': {
      newState = {
        ...state,
        fairwayIds: (value as number[]).sort((a, b) => a - b),
      };
      if ((value as number[]).length === 1) {
        const onlyLinkedFairwayInArray = [{ id: (value as number[])[0], sequenceNumber: 1 }] as SelectedFairwayInput[];
        newState.primaryFairwayId = onlyLinkedFairwayInArray;
        newState.secondaryFairwayId = onlyLinkedFairwayInArray;
      }
      // this monster of a conditional clause is to update sequencing when one of the linked fairways are removed
      if (state.fairwayIds && state.fairwayIds.length > newState.fairwayIds.length) {
        const removedId = state.fairwayIds.find((id) => !(value as number[]).includes(id));
        const removedStartingFairway = state.primaryFairwayId?.find((fairway) => fairway.id === removedId) as SelectedFairwayInput;
        const newPrimaryValues = state.primaryFairwayId?.filter((f) => f.id !== removedId) as SelectedFairwayInput[];

        const removedEndingFairway = state.secondaryFairwayId?.find((fairway) => fairway.id === removedId) as SelectedFairwayInput;
        const newSecondaryValues = state.secondaryFairwayId?.filter((f) => f.id !== removedId) as SelectedFairwayInput[];
        if (removedStartingFairway) {
          newState.primaryFairwayId = removeSequence(
            removedStartingFairway,
            newPrimaryValues,
            removedStartingFairway?.sequenceNumber
          ) as SelectedFairwayInput[];
        }
        if (removedEndingFairway) {
          newState.secondaryFairwayId = removeSequence(
            removedEndingFairway,
            newSecondaryValues,
            removedEndingFairway?.sequenceNumber
          ) as SelectedFairwayInput[];
        }
      }
      break;
    }
    case 'fairwayPrimary':
      newState = { ...state, primaryFairwayId: (value as SelectedFairwayInput[]).sort((a, b) => a.sequenceNumber - b.sequenceNumber) };
      break;
    case 'fairwaySecondary':
      newState = { ...state, secondaryFairwayId: (value as SelectedFairwayInput[]).sort((a, b) => a.sequenceNumber - b.sequenceNumber) };
      break;
    case 'harbours':
      newState = { ...state, harbors: value as string[] };
      break;
    case 'pilotRoutes':
      newState = { ...state, pilotRoutes: value as number[] };
      break;
    case 'referenceLevel':
      newState = { ...state, n2000HeightSystem: !!value, harbors: [] };
      break;
    case 'group':
      newState = { ...state, group: value as string };
      break;
    case 'publishDetails':
      newState = { ...state, publishDetails: value as string };
      break;
    case 'additionalInfo':
      if (!actionLang) return state;
      newState = {
        ...state,
        additionalInfo: {
          ...(state.additionalInfo ?? { fi: '', sv: '', en: '' }),
          [actionLang as string]: value as string,
        },
      };
      break;

    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

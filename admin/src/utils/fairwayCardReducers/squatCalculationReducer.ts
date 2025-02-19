import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const squatCalculationReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'squatCalculations':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          squatCalculations: state.squatCalculations?.concat({
            place: { fi: '', sv: '', en: '' },
            additionalInformation: { fi: '', sv: '', en: '' },
            fairwayWidth: '',
            estimatedWaterDepth: '',
            slopeHeight: '',
            slopeScale: '',
          }),
        };

        //Add the default value for the target fairway if only one exists in the fairway card
        if (state.fairwayIds.length === 1 && newState.squatCalculations) {
          const newCalcIndex = state.squatCalculations ? state.squatCalculations.length : 0;
          newState.squatCalculations[newCalcIndex].targetFairways = [state.fairwayIds[0]];
        }
      } else {
        newState = {
          ...state,
          squatCalculations: state.squatCalculations?.filter((_, idx) => idx !== actionTarget),
        };
      }

      break;
    case 'squatCalculationAdditionalInformation':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                additionalInformation: {
                  ...(calcItem?.additionalInformation ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value,
                },
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationPlace':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                place: {
                  ...(calcItem?.place ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value,
                },
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationDepth':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                depth: value as number,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationFairwayForm':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                fairwayForm: value as number,
                fairwayWidth: value.toString() === '1' ? '' : calcItem.fairwayWidth,
                slopeHeight: ['1', '2'].includes(value.toString()) ? '' : calcItem.slopeHeight,
                slopeScale: ['1', '2'].includes(value.toString()) ? '' : calcItem.slopeScale,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationEstimatedWaterDepth':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                estimatedWaterDepth: value as string,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationFairwayWidth':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                fairwayWidth: value as string,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationSlopeScale':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                slopeScale: value as string,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationSlopeHeight':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                slopeHeight: value as string,
              }
            : calcItem
        ),
      };
      break;
    case 'squatTargetFairwayIds':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                targetFairways: value as number[],
              }
            : calcItem
        ),
      };
      break;
    case 'squatSuitableFairwayAreaIds':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                suitableFairwayAreas: value as number[],
              }
            : calcItem
        ),
      };
      break;

    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

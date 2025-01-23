import { HarborInput } from '../../graphql/generated';
import { ActionType, Lang, ValueType } from '../constants';

export const sectionReducer = (
  state: HarborInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): HarborInput => {
  let newState;
  switch (actionType) {
    case 'section':
      // Add and delete
      if (value && actionOuterTarget !== undefined) {
        newState = {
          ...state,
          quays: state.quays?.map((quayItem, i) =>
            i === actionOuterTarget
              ? {
                  ...quayItem,
                  sections: (quayItem?.sections ?? []).concat([{ name: '', depth: '', geometry: { lat: '', lon: '' } }]),
                }
              : quayItem
          ),
        };
      } else if (!value && actionTarget !== undefined) {
        newState = {
          ...state,
          quays: state.quays?.map((quayItem, i) => {
            if (i === actionOuterTarget) {
              return {
                ...quayItem,
                sections: quayItem?.sections?.filter((sectionItem, idx) => idx !== actionTarget),
              };
            } else {
              return { ...quayItem };
            }
          }),
        };
      } else {
        return state;
      }
      break;
    case 'sectionName':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        name: value as string,
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    case 'sectionDepth':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        depth: value as string,
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    case 'sectionLat':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        geometry: { lat: (value as string) || '', lon: sectionItem?.geometry?.lon ?? '' },
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    case 'sectionLon':
      newState = {
        ...state,
        quays: state.quays?.map((quayItem, idx) =>
          idx === actionOuterTarget
            ? {
                ...quayItem,
                sections: quayItem?.sections?.map((sectionItem, j) =>
                  j === actionTarget
                    ? {
                        ...sectionItem,
                        geometry: { lat: sectionItem?.geometry?.lat ?? '', lon: (value as string) || '' },
                      }
                    : sectionItem
                ),
              }
            : quayItem
        ),
      };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

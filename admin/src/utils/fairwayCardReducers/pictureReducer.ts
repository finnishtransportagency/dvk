import { FairwayCardInput, PictureInput } from '../../graphql/generated';
import { sortPictures } from '../common';
import { ActionType, Lang, ValueType } from '../constants';

export const pictureReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number
): FairwayCardInput => {
  let newState;
  switch (actionType) {
    case 'picture':
      newState = {
        ...state,
        pictures: sortPictures(value as PictureInput[]),
      };
      break;
    case 'pictureDescription':
      newState = {
        ...state,
        pictures: state.pictures?.map((pic) => (pic.groupId === actionTarget && pic.lang === actionLang ? { ...pic, text: value as string } : pic)),
      };
      break;
    case 'pictureLegendPosition':
      newState = {
        ...state,
        pictures: state.pictures?.map((pic) => (pic.groupId === actionTarget ? { ...pic, legendPosition: value as string } : pic)),
      };
      break;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  return newState;
};

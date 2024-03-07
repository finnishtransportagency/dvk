import { getMap } from '../components/map/DvkMap';
import { useUploadMapPictureMutationQuery } from '../graphql/api';
import { FairwayCardInput, Orientation, PictureInput, PictureUploadInput } from '../graphql/generated';
import { ActionType, Lang, ValueType } from './constants';

export function useUploadMapPictureMutation(
  newPicture: (PictureInput & PictureUploadInput) | undefined,
  setPicture: (
    val: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void,
  setNewPicture: (picture: (PictureInput & PictureUploadInput) | undefined) => void,
  fairwayCardInput: FairwayCardInput
) {
  const dvkMap = getMap();
  const { mutateAsync: uploadMapPictureMutation, isPending: isLoadingMutation } = useUploadMapPictureMutationQuery({
    onSuccess: () => {
      if (newPicture) {
        const pictureInput = {
          id: newPicture.id,
          orientation: dvkMap.getOrientationType() || Orientation.Portrait,
          rotation: newPicture.rotation ?? null,
          modificationTimestamp: Date.now(),
          scaleWidth: newPicture.scaleWidth ?? null,
          scaleLabel: newPicture.scaleLabel ?? null,
          sequenceNumber: null,
          text: null,
          lang: newPicture.lang ?? null,
          groupId: newPicture.groupId,
          legendPosition: newPicture.legendPosition,
        };
        // Update fairwayCard state with uploaded picture data
        setPicture(fairwayCardInput.pictures?.concat([pictureInput]) ?? [], 'picture');
      }
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
    onSettled: () => {
      setNewPicture(undefined);
    },
  });
  return { uploadMapPictureMutation, isLoadingMutation };
}

import { Coordinate } from 'ol/coordinate';
import { getMap } from '../components/map/DvkMap';
import { useUploadMapPictureMutationQuery } from '../graphql/api';
import { FairwayCardInput, Orientation, PictureInput, PictureUploadInput } from '../graphql/generated';
import { ActionType, Lang, MAP, ValueType } from './constants';

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

export function getExportMapBase64Data(canvasSizeCropped: number[], mapCanvas: HTMLCanvasElement, mapSize: number[]) {
  // Crop the canvas and create image
  const mapCanvasCropped = document.createElement('canvas');
  mapCanvasCropped.width = canvasSizeCropped[0];
  mapCanvasCropped.height = canvasSizeCropped[1];
  const mapContextCropped = mapCanvasCropped.getContext('2d');
  if (mapContextCropped) {
    mapContextCropped.drawImage(
      mapCanvas,
      (mapSize[0] * MAP.PRINT.SCALE - mapCanvasCropped.width) / 2,
      (mapSize[1] * MAP.PRINT.SCALE - mapCanvasCropped.height) / 2,
      mapCanvasCropped.width,
      mapCanvasCropped.height,
      0,
      0,
      mapCanvasCropped.width,
      mapCanvasCropped.height
    );
  }
  return mapCanvasCropped.toDataURL('image/png');
}

export function getMatrix(canvas: HTMLCanvasElement) {
  const transform = canvas.style.transform;
  const matrix = transform
    ? RegExp(/^matrix\(([^(]*)\)$/)
        .exec(transform)?.[1]
        .split(',')
        .map(Number)
    : [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
  return matrix as DOMMatrix2DInit;
}

export function processCanvasElements(mapCanvas: HTMLCanvasElement) {
  const dvkMap = getMap();
  const mapContext = mapCanvas.getContext('2d');
  Array.prototype.forEach.call(dvkMap.olMap?.getViewport().querySelectorAll('.ol-layer canvas'), function (canvas) {
    if (canvas.width > 0) {
      const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
      if (mapContext) {
        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
      }
      const matrix = getMatrix(canvas);
      // Apply the transform to the export map context
      CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, [matrix]);
      const backgroundColor = canvas.parentNode.style.backgroundColor;
      if (backgroundColor && mapContext) {
        mapContext.fillStyle = backgroundColor;
        mapContext.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (mapContext) {
        mapContext.drawImage(canvas, 0, 0);
        mapContext.globalAlpha = 1;
        mapContext.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  });
}

export function getMapCanvas(mapSize: number[]) {
  // Merge canvases to one canvas
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = mapSize[0] * MAP.PRINT.SCALE;
  mapCanvas.height = mapSize[1] * MAP.PRINT.SCALE;

  return mapCanvas;
}

export function setMapProperties(viewResolution: number, mapSize: number[], lang: Lang, center: Coordinate | undefined) {
  const dvkMap = getMap();
  dvkMap?.olMap?.getView().setResolution(viewResolution / MAP.PRINT.SCALE);
  dvkMap?.olMap?.setSize([mapSize[0] * MAP.PRINT.SCALE, mapSize[1] * MAP.PRINT.SCALE]);
  dvkMap.setMapLanguage(lang);
  dvkMap.olMap?.getView().setCenter(center);
}

export function resetMapProperties(viewResolution: number, mapSize: number[], center: Coordinate | undefined) {
  const dvkMap = getMap();
  dvkMap.setMapLanguage('');
  dvkMap.olMap?.setSize(mapSize);
  dvkMap.olMap?.getView().setResolution(viewResolution);
  dvkMap.olMap?.getView().setCenter(center);
}

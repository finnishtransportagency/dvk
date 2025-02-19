import dvkMap, { DvkMap, getMap } from '../components/map/DvkMap';
import { CurrentMapViewProps } from '../components/pictures/MapExportTool';
import { useUploadMapPictureMutationQuery } from '../graphql/api';
import { FairwayCardInput, Orientation, PictureInput, PictureUploadInput, UploadMapPictureMutation } from '../graphql/generated';
import { ActionType, Lang, locales, MAP, POSITION, ValueType } from './constants';

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

export function setMapProperties(viewResolution: number, mapSize: number[], lang: Lang) {
  const dvkMap = getMap();
  dvkMap?.olMap?.getView().setResolution(viewResolution / MAP.PRINT.SCALE);
  dvkMap?.olMap?.setSize([mapSize[0] * MAP.PRINT.SCALE, mapSize[1] * MAP.PRINT.SCALE]);
  dvkMap.setMapLanguage(lang);
}

export function resetMapProperties(viewResolution: number, mapSize: number[]) {
  const dvkMap = getMap();
  dvkMap.setMapLanguage('');
  dvkMap.olMap?.setSize(mapSize);
  dvkMap.olMap?.getView().setResolution(viewResolution);
}

export const uploadPicture = async (
  fairwayCardInput: FairwayCardInput,
  uploadMapPictureMutation: (picture: { picture: PictureUploadInput }) => Promise<UploadMapPictureMutation>,
  setNewPicture: (pictureInput: (PictureInput & PictureUploadInput) | undefined) => void,
  base64Data: string,
  orientation: Orientation,
  groupId: number,
  lang?: string,
  scaleWidth?: string,
  scaleLabel?: string
) => {
  const rotation = dvkMap.olMap?.getView().getRotation();

  const picUploadObject = {
    base64Data: base64Data.replace('data:image/png;base64,', ''),
    cardId: fairwayCardInput.id,
    cardVersion: fairwayCardInput.version,
    contentType: 'image/png',
    id: `${fairwayCardInput.id}-${groupId}-${lang}`,
  };
  const picInputObject = {
    orientation,
    rotation,
    scaleWidth,
    scaleLabel,
    lang,
    groupId,
    legendPosition: POSITION.bottomLeft,
  };
  setNewPicture({ ...picUploadObject, ...picInputObject });
  await uploadMapPictureMutation({
    picture: picUploadObject,
  });
};

export const exportMapByLang = (
  fairwayCardInput: FairwayCardInput,
  uploadMapPictureMutation: (picture: { picture: PictureUploadInput }) => Promise<UploadMapPictureMutation>,
  setNewPicture: (pictureInput: (PictureInput & PictureUploadInput) | undefined) => void,
  dvkMap: DvkMap,
  viewResolution: number,
  lang: Lang,
  picGroupId: number
): Promise<string> => {
  return new Promise((resolve) => {
    if (dvkMap.olMap && dvkMap.getOrientationType()) {
      const mapSize = dvkMap.olMap?.getSize() ?? [0, 0];
      const mapCanvas = getMapCanvas(mapSize);
      const canvasSizeCropped = dvkMap.getCanvasDimensions();

      setMapProperties(viewResolution, mapSize, lang);

      dvkMap.olMap.once('rendercomplete', async function () {
        const mapScale = dvkMap.olMap?.getViewport().querySelector('.ol-scale-line-inner');
        const mapScaleWidth = mapScale?.getAttribute('style')?.replace(/\D/g, '');

        processCanvasElements(mapCanvas);

        const base64Data = getExportMapBase64Data(canvasSizeCropped, mapCanvas, mapSize);

        await uploadPicture(
          fairwayCardInput,
          uploadMapPictureMutation,
          setNewPicture,
          base64Data,
          dvkMap.getOrientationType() || Orientation.Portrait,
          picGroupId,
          lang,
          mapScaleWidth,
          mapScale?.innerHTML
        );
        // Reset original map properties
        resetMapProperties(viewResolution, mapSize);
        dvkMap.olMap?.once('rendercomplete', function () {
          resolve(`Map export for locale ${lang} done.`);
        });
      });
    } else {
      Promise.reject(new Error(`Map export for locale ${lang} failed.`));
    }
  });
};

export const printCurrentMapView = async (props: CurrentMapViewProps) => {
  const dvkMap = props.dvkMap;

  console.time('Export pictures');
  if (dvkMap.olMap && dvkMap.getOrientationType()) {
    props.setIsMapDisabled(true);
    props.setIsProcessingCurLang(true);

    const viewResolution = dvkMap.olMap.getView().getResolution() ?? 1;
    const picGroupId = Date.now();

    for (const locale of locales) {
      if (locale !== props.curLang) {
        props.setIsProcessingCurLang(false);
      }
      await exportMapByLang(
        props.fairwayCardInput,
        props.uploadMapPictureMutation,
        props.setNewPicture,
        dvkMap,
        viewResolution,
        locale as Lang,
        picGroupId
      );
    }

    props.setIsMapDisabled(false);
  }
  console.timeEnd('Export pictures');
};

export const importExternalImage = async (props: CurrentMapViewProps) => {
  console.time('Import pictures');
  if (props.dvkMap.getOrientationType()) {
    props.setIsMapDisabled(true);
    props.setIsProcessingCurLang(true);

    try {
      const picGroupId = Date.now();
      const base64Data = await props.fileUploader?.getPictureBase64Data();

      if (base64Data) {
        for (const locale of locales) {
          if (locale !== props.curLang) props.setIsProcessingCurLang(false);
          await uploadPicture(
            props.fairwayCardInput,
            props.uploadMapPictureMutation,
            props.setNewPicture,
            base64Data as string,
            props.dvkMap.getOrientationType() || Orientation.Portrait,
            picGroupId,
            locale as Lang
          );
        }
      }
    } catch (error) {
      console.log(error);
      props?.setPicUploadErrors?.([...(props.picUploadErrors ?? []), error as string]);
    }
    props.setIsMapDisabled(false);
    props.setIsProcessingCurLang(false);
    props.fileUploader?.deleteFiles();
  }
  console.timeEnd('Import pictures');
};

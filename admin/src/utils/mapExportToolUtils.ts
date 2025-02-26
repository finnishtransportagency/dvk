import { Coordinate } from 'ol/coordinate';
import dvkMap, { DvkMap, getMap } from '../components/map/DvkMap';
import { useUploadMapPictureMutationQuery } from '../graphql/api';
import { FairwayCardInput, Orientation, PictureInput, PictureUploadInput, UploadMapPictureMutation } from '../graphql/generated';
import { ActionType, Lang, locales, MAP, POSITION, ValueType } from './constants';
import FileUploader from './FileUploader';

type CardImage = {
  cardId: string;
  cardVersion: string;
  uploadMapPictureMutation: (picture: { picture: PictureUploadInput }) => Promise<UploadMapPictureMutation>;
  setNewPicture: (pictureInput: (PictureInput & PictureUploadInput) | undefined) => void;
};

type ImageUploader = {
  base64Data: string;
  orientation: Orientation;
  timestamp: number;
  lang?: string;
  scaleWidth?: string;
  scaleLabel?: string;
} & CardImage;

export type MapControlUploader = {
  setIsMapDisabled: (disabled: boolean) => void;
  setIsProcessingCurLang: (processing: boolean) => void;
  curLang: string;
  setPicUploadErrors?: (errors: string[]) => void;
  picUploadErrors?: string[];
  dvkMap: DvkMap;
} & CardImage;

export type MapControlExternalPictureUploader = {
  fileUploader?: FileUploader;
} & MapControlUploader;

export function useUploadMapPictureMutation(
  newPicture: (PictureInput & PictureUploadInput) | undefined,
  updateState: (
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
        updateState(fairwayCardInput.pictures?.concat([pictureInput]) ?? [], 'picture');
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

export function getExportMapBase64Data(
  exportImageCanvasDimensions: number[],
  mapCanvas: HTMLCanvasElement,
  sizeOfMapControl: number[],
  resolutionScaling: number
) {
  // Crop the canvas and create image
  const exportImageCanvas = document.createElement('canvas');
  exportImageCanvas.width = exportImageCanvasDimensions[0];
  exportImageCanvas.height = exportImageCanvasDimensions[1];
  const exportImageContext = exportImageCanvas.getContext('2d');

  //The map canvas is bigger than the cropped canvas by an amount that equals the margin in the UI.
  //By calculating the difference and dividing by 2, this is the clipping amount
  //
  //        ---------------------------------------
  //        |         ^                           |
  //        |       m |    MapControl             |
  //        |         v     canvas                |
  //        |<------>---------------------        |
  //        |    l   |                   |        |  l = (sizeOfMapControl[0] * resolutionScaling - exportImageCanvas.width) / 2
  //        |        |   Export image    |        |  m = (sizeOfMapControl[1] * resolutionScaling - exportImageCanvas.height) / 2,
  //        |        |   canvas          |        |
  //        |        ---------------------        |
  //        |                                     |
  //        |                                     |
  //        |                                     |
  //        ---------------------------------------
  // This ensures that the top left on the image canvas is the top left from the selected area on the map
  // (since the margin will fit in the overlapping recatangle)
  //
  //  See the documentation here https://www.w3schools.com/jsref/canvas_drawimage.asp
  if (exportImageContext) {
    exportImageContext.drawImage(
      mapCanvas,
      (sizeOfMapControl[0] * resolutionScaling - exportImageCanvas.width) / 2,
      (sizeOfMapControl[1] * resolutionScaling - exportImageCanvas.height) / 2,
      exportImageCanvas.width,
      exportImageCanvas.height,
      0,
      0,
      exportImageCanvas.width,
      exportImageCanvas.height
    );
  }
  return exportImageCanvas.toDataURL('image/png');
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

export function processCanvasElements(mapDrawingCanvas: HTMLCanvasElement, dvkMap: DvkMap) {
  //Get the canvas context - here we are using the 2d drawing context
  const mapDrawingContext = mapDrawingCanvas.getContext('2d');
  Array.prototype.forEach.call(dvkMap.olMap?.getViewport().querySelectorAll('.ol-layer canvas'), function (layerCanvas) {
    if (layerCanvas.width > 0) {
      const opacity = layerCanvas.parentNode.style.opacity || layerCanvas.style.opacity;
      if (mapDrawingContext) {
        mapDrawingContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
      }
      const matrix = getMatrix(layerCanvas);
      // Apply the transform to the export map context
      CanvasRenderingContext2D.prototype.setTransform.apply(mapDrawingContext, [matrix]);
      const backgroundColor = layerCanvas.parentNode.style.backgroundColor;
      if (backgroundColor && mapDrawingContext) {
        mapDrawingContext.fillStyle = backgroundColor;
        mapDrawingContext.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
      }
      if (mapDrawingContext) {
        mapDrawingContext.drawImage(layerCanvas, 0, 0);
        mapDrawingContext.globalAlpha = 1;
        mapDrawingContext.setTransform(1, 0, 0, 1, 0, 0);
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

export function setMapProperties(viewResolution: number, mapSize: number[], lang: Lang, center: Coordinate | undefined): number {
  const dvkMap = getMap();
  dvkMap?.olMap?.getView().setResolution(viewResolution / MAP.PRINT.SCALE);

  //Check the resolution, to find out what the actual "scale" is
  //If we are zoomed in to resolution 0.5 => the resolution of the map will not change, so reverse calculate the zoom factor
  const resolutionScaling = viewResolution / (dvkMap?.olMap?.getView().getResolution() ?? 1);

  //Make the map bigger than the actual print canvas which is fitted for A4 at 90dpi
  //This is clipped later
  dvkMap?.olMap?.setSize([mapSize[0] * resolutionScaling, mapSize[1] * resolutionScaling]);
  dvkMap.setMapLanguage(lang);
  dvkMap.olMap?.getView().setCenter(center);
  return resolutionScaling;
}

export function resetMapProperties(viewResolution: number, mapSize: number[], center: Coordinate | undefined) {
  const dvkMap = getMap();
  dvkMap.setMapLanguage('');
  dvkMap.olMap?.setSize(mapSize);
  dvkMap.olMap?.getView().setResolution(viewResolution);
  dvkMap.olMap?.getView().setCenter(center);
}

export const uploadPicture = async (imageUploader: ImageUploader) => {
  const picUploadObject = {
    base64Data: imageUploader.base64Data.replace('data:image/png;base64,', ''),
    cardId: imageUploader.cardId,
    cardVersion: imageUploader.cardVersion,
    contentType: 'image/png',
    id: `${imageUploader.cardId}-${imageUploader.timestamp}-${imageUploader.lang}`,
  };
  const picInputObject = {
    orientation: imageUploader.orientation,
    rotation: dvkMap.olMap?.getView().getRotation(),
    scaleWidth: imageUploader.scaleWidth,
    scaleLabel: imageUploader.scaleLabel,
    lang: imageUploader.lang,
    groupId: imageUploader.timestamp,
    legendPosition: POSITION.bottomLeft,
  };
  imageUploader.setNewPicture({ ...picUploadObject, ...picInputObject });
  await imageUploader.uploadMapPictureMutation({
    picture: picUploadObject,
  });
};

export const createMapImageByLang = (
  cardImage: CardImage,
  dvkMap: DvkMap,
  center: Coordinate | undefined,
  viewResolution: number,
  lang: Lang,
  timestamp: number
): Promise<string> => {
  return new Promise((resolve) => {
    if (dvkMap.olMap && dvkMap.getOrientationType()) {
      const sizeOfMapControl = dvkMap.olMap?.getSize() ?? [0, 0];
      const mapDrawingCanvas = getMapCanvas(sizeOfMapControl);

      //When resolution is less than 0.5*1.7, the desired resolution is not achievable
      //The code tries to make a bigger map (*1.7 in X,Y directions) and then zoom in so the same extent is used
      //If the resollution is < 0.5*1.7, this is not possible since 0.5 is teh hard limit
      //In this case return the ratio of resolutions and use it to crop the canvas
      const resolutionScaling = setMapProperties(viewResolution, sizeOfMapControl, lang, center);
      const exportImageCanvasDimensions = dvkMap.getExportImageCanvasDimensions(resolutionScaling);

      dvkMap.olMap.once('rendercomplete', async function () {
        const imageUploader: ImageUploader = {
          ...cardImage,
          timestamp,
          orientation: dvkMap.getOrientationType() || Orientation.Portrait,
          lang,
          base64Data: '',
        };

        const mapScale = dvkMap.olMap?.getViewport().querySelector('.ol-scale-line-inner');
        imageUploader.scaleWidth = mapScale?.getAttribute('style')?.replace(/\D/g, '');
        imageUploader.scaleLabel = mapScale?.innerHTML;

        //Draw the map and layers onto a canvas
        processCanvasElements(mapDrawingCanvas, dvkMap);

        //Centre the enlarged map on the export image canvas and convert to Base 64
        imageUploader.base64Data = getExportMapBase64Data(exportImageCanvasDimensions, mapDrawingCanvas, sizeOfMapControl, resolutionScaling);

        // This line can be added to help debugging
        // Create a target window : const canvasDebug = window.open('', 'canvasDebug');
        // Write the image to the window: canvasDebug?.document.write('<img src="' + base64Data + '"/>');
        imageUploader.orientation = dvkMap.getOrientationType() || Orientation.Portrait;

        // Reset original map properties
        resetMapProperties(viewResolution, sizeOfMapControl, center);

        //Upload the image to S3
        await uploadPicture(imageUploader);

        dvkMap.olMap?.once('rendercomplete', function () {
          resolve(`Map export for locale ${lang} done.`);
        });
        dvkMap.olMap?.renderSync();
      });
      dvkMap.olMap?.renderSync();
    } else {
      Promise.reject(new Error(`Map export for locale ${lang} failed.`));
    }
  });
};

const setUploadState = (uploader: MapControlUploader | MapControlExternalPictureUploader, mapDisabled: boolean, isCurrentLang: boolean) => {
  uploader.setIsMapDisabled(mapDisabled);
  uploader.setIsProcessingCurLang(isCurrentLang);
};

export const createMapImages = async (snapshotUploader: MapControlUploader) => {
  const dvkMap = snapshotUploader.dvkMap;

  console.time('Export pictures');
  if (dvkMap.olMap && dvkMap.getOrientationType()) {
    setUploadState(snapshotUploader, true, true);
    const timestamp = Date.now();

    //Get center and resolution of map and pass them to export map function as the map needs to be reset afterwards
    const viewResolution = dvkMap.olMap.getView().getResolution() ?? 1;
    const center = dvkMap.olMap.getView().getCenter();

    for (const locale of locales) {
      setUploadState(snapshotUploader, true, locale !== snapshotUploader.curLang);
      await createMapImageByLang(snapshotUploader as CardImage, dvkMap, center, viewResolution, locale as Lang, timestamp);
    }
    setUploadState(snapshotUploader, false, false);
  }
  console.timeEnd('Export pictures');
};

export const importExternalImage = async (fileImageUploader: MapControlExternalPictureUploader) => {
  console.time('Import pictures');
  if (fileImageUploader.dvkMap.getOrientationType()) {
    setUploadState(fileImageUploader, true, true);
    try {
      const timestamp = Date.now();
      const base64Data = await fileImageUploader.fileUploader?.getPictureBase64Data();

      if (base64Data) {
        for (const locale of locales) {
          setUploadState(fileImageUploader, true, locale !== fileImageUploader.curLang);
          const imageUploader: ImageUploader = {
            ...(fileImageUploader as CardImage),
            lang: locale,
            base64Data: base64Data as string,
            timestamp,
            orientation: fileImageUploader.dvkMap.getOrientationType() || Orientation.Portrait,
          };
          await uploadPicture(imageUploader);
        }
      }
    } catch (error) {
      console.log(error);
      fileImageUploader?.setPicUploadErrors?.([...(fileImageUploader.picUploadErrors ?? []), error as string]);
    }
    setUploadState(fileImageUploader, false, false);
    fileImageUploader.fileUploader?.deleteFiles();
  }
  console.timeEnd('Import pictures');
};

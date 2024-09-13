import React, { useEffect, useRef, useState } from 'react';
import { IonCol, IonGrid, IonProgressBar, IonRow, useIonViewWillEnter } from '@ionic/react';
import { InitDvkMap, getMap } from '../map/DvkMap';
import {
  DvkLayerState,
  useArea12Layer,
  useArea3456Layer,
  useBackgroundBalticseaLayer,
  useBackgroundFinlandLayer,
  useBackgroundMmlSatamatLayer,
  useBoardLine12Layer,
  useCircleLayer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useNameLayer,
  usePilotLayer,
  usePilotageLimitLayer,
  usePilotageAreaBorderLayer,
  useSafetyEquipmentLayer,
  useSpecialArea15Layer,
  useSpecialArea2Layer,
  useSpeedLimitLayer,
  useVtsLineLayer,
  useVtsPointLayer,
} from '../map/FeatureLoader';
import { Fairway, FairwayCardInput, Harbor, Orientation, PictureInput, PictureUploadInput } from '../../graphql/generated';
import { setSelectedFairwayCard } from '../map/layers';
import { useIsFetching } from '@tanstack/react-query';
import './MapExportTool.css';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, POSITION, ValidationType, ValueType, locales } from '../../utils/constants';
import LayerModal from '../map/mapOverlays/LayerModal';
import Alert from '../Alert';
import FileUploader from '../../utils/FileUploader';
import NotificationModal from '../NotificationModal';
import {
  getExportMapBase64Data,
  getMapCanvas,
  processCanvasElements,
  resetMapProperties,
  setMapProperties,
  useUploadMapPictureMutation,
} from '../../utils/mapExportToolUtils';
import { usePilotRouteLayer } from '../map/PilotRouteFeatureLoader';
import { ExtMapControls } from './ExtMapControls';
import { PrintImages } from './PrintImages';

interface MapExportToolProps {
  fairwayCardInput: FairwayCardInput;
  disabled: boolean;
  fairways?: Fairway[];
  harbours?: Harbor[];
  setPicture: (
    val: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors?: ValidationType[];
  sourceCard?: string;
}

const MapExportTool: React.FC<MapExportToolProps> = ({
  fairwayCardInput,
  fairways,
  harbours,
  setPicture,
  validationErrors,
  disabled,
  sourceCard,
}) => {
  const { t, i18n } = useTranslation();
  const curLang = i18n.resolvedLanguage as Lang;
  const [fileUploader] = useState<FileUploader>(() => new FileUploader());
  const [picUploadErrors, setPicUploadErrors] = useState<string[]>([]);
  // Picture with input data waiting for upload
  const [newPicture, setNewPicture] = useState<(PictureInput & PictureUploadInput) | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const isFetching = useIsFetching();
  const hasPrimaryIdError = !fairwayCardInput.id || (validationErrors?.filter((error) => error.id === 'primaryId' && error.msg) ?? []).length > 0;
  const [isMapDisabled, setIsMapDisabled] = useState(hasPrimaryIdError || disabled);
  // Create uploadable images with every locale
  const [isProcessingCurLang, setIsProcessingCurLang] = useState(false);

  const { uploadMapPictureMutation, isLoadingMutation } = useUploadMapPictureMutation(newPicture, setPicture, setNewPicture, fairwayCardInput);

  InitDvkMap();

  /* Start initializing layers that are required at ap start first */
  const line12Layer = useLine12Layer();
  const area12Layer = useArea12Layer();
  const specialArea2Layer = useSpecialArea2Layer();
  const specialArea15Layer = useSpecialArea15Layer();
  const pilotLayer = usePilotLayer();
  const harborLayer = useHarborLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const bgFinlandLayer = useBackgroundFinlandLayer();
  const bgMmlSatamatLayer = useBackgroundMmlSatamatLayer();
  const circleLayer = useCircleLayer();
  const pilotRouteLayer = usePilotRouteLayer();
  const pilotageLimitLayer = usePilotageLimitLayer();
  const pilotageAreaBorderLayer = usePilotageAreaBorderLayer();
  /* Start initializing other layers */
  useDepth12Layer();
  useSpeedLimitLayer();
  useSafetyEquipmentLayer();
  useNameLayer();
  useVtsLineLayer();
  useVtsPointLayer();
  useLine3456Layer();
  useArea3456Layer();
  useBackgroundBalticseaLayer();
  const [initDone, setInitDone] = useState(false);
  const [percentDone, setPercentDone] = useState(0);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const allLayers: DvkLayerState[] = [
      line12Layer,
      area12Layer,
      specialArea2Layer,
      specialArea15Layer,
      pilotLayer,
      harborLayer,
      boardLine12Layer,
      bgFinlandLayer,
      bgMmlSatamatLayer,
      circleLayer,
      pilotRouteLayer,
      pilotageLimitLayer,
      pilotageAreaBorderLayer,
    ];

    let percent = 0;
    const resourcePercentage = 1 / allLayers.length;

    allLayers.forEach(function (layer) {
      if (layer.ready) percent += resourcePercentage;
    });

    setPercentDone(Math.round(percent * 100) / 100);

    setFetchError(allLayers.some((layer) => layer.isError));

    setInitDone(allLayers.every((layer) => layer.ready));
  }, [
    line12Layer,
    area12Layer,
    pilotLayer,
    harborLayer,
    boardLine12Layer,
    bgFinlandLayer,
    bgMmlSatamatLayer,
    circleLayer,
    specialArea2Layer,
    specialArea15Layer,
    pilotRouteLayer,
    pilotageLimitLayer,
    pilotageAreaBorderLayer,
  ]);

  const dvkMap = getMap();

  const mapElement = useRef<HTMLDivElement | null>(null);
  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addRotationControl();
      dvkMap.setTarget(mapElement.current);
    }
  });

  useEffect(() => {
    const fairwayCard = {
      id: fairwayCardInput.id,
      fairwayIds: fairwayCardInput.fairwayIds,
      fairways: fairways ?? [],
      group: fairwayCardInput.group,
      name: {
        fi: fairwayCardInput.name.fi,
        sv: fairwayCardInput.name.sv,
        en: fairwayCardInput.name.en,
      },
      n2000HeightSystem: fairwayCardInput.n2000HeightSystem,
      harbors: harbours ?? [],
    };
    setSelectedFairwayCard(fairwayCard);
  }, [fairwayCardInput, fairways, harbours, initDone]);

  const uploadPicture = async (
    base64Data: string,
    orientation: Orientation,
    groupId: number,
    lang?: string,
    rotation?: number,
    scaleWidth?: string,
    scaleLabel?: string
  ) => {
    const picUploadObject = {
      base64Data: base64Data.replace('data:image/png;base64,', ''),
      cardId: fairwayCardInput.id,
      contentType: 'image/png',
      id: fairwayCardInput.id + '-' + groupId + '-' + lang,
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

  const exportMapByLang = (viewResolution: number, rotation: number, lang: Lang, picGroupId: number): Promise<string> => {
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
            base64Data,
            dvkMap.getOrientationType() || Orientation.Portrait,
            picGroupId,
            lang,
            rotation,
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

  const printCurrentMapView = async () => {
    console.time('Export pictures');
    if (dvkMap.olMap && dvkMap.getOrientationType()) {
      setIsMapDisabled(true);
      setIsProcessingCurLang(true);

      const rotation = dvkMap.olMap.getView().getRotation();
      const viewResolution = dvkMap.olMap.getView().getResolution() ?? 1;
      const picGroupId = Date.now();

      for (const locale of locales) {
        if (locale !== curLang) setIsProcessingCurLang(false);
        await exportMapByLang(viewResolution, rotation, locale as Lang, picGroupId);
      }

      setIsMapDisabled(false);
    }
    console.timeEnd('Export pictures');
  };

  const importExternalImage = async () => {
    console.time('Import pictures');
    if (dvkMap.getOrientationType()) {
      setIsMapDisabled(true);
      setIsProcessingCurLang(true);

      try {
        const picGroupId = Date.now();
        const base64Data = await fileUploader.getPictureBase64Data();

        if (base64Data) {
          for (const locale of locales) {
            if (locale !== curLang) setIsProcessingCurLang(false);
            await uploadPicture(base64Data as string, dvkMap.getOrientationType() || Orientation.Portrait, picGroupId, locale as Lang);
          }
        }
      } catch (error) {
        console.log(error);
        setPicUploadErrors([...picUploadErrors, error as string]);
      }
      setIsMapDisabled(false);
      setIsProcessingCurLang(false);
      fileUploader.deleteFiles();
    }
    console.timeEnd('Import pictures');
  };

  return (
    <>
      <IonGrid className={'mapExportTool' + (isMapDisabled ? ' disabled' : '')}>
        <IonRow>
          <IonCol>
            <LayerModal isOpen={isOpen} setIsOpen={setIsOpen} />
            {hasPrimaryIdError && <Alert alertType="info" text={t('fairwaycard.print-images-card-id-required')} extraClass="ion-margin-bottom" />}
            {(!!isFetching || !initDone) && (
              <IonProgressBar
                value={percentDone}
                buffer={percentDone}
                type={!!isFetching && initDone ? 'indeterminate' : 'determinate'}
                className={fetchError ? 'danger' : ''}
              />
            )}
            <ExtMapControls
              printCurrentMapView={printCurrentMapView}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              printDisabled={isLoadingMutation || isMapDisabled}
              fileUploader={fileUploader}
              importExternalImage={importExternalImage}
              setErrors={setPicUploadErrors}
            />
            <div className="mainMapWrapper" ref={mapElement} data-testid="mapElement"></div>
          </IonCol>
          <IonCol>
            <PrintImages
              fairwayCardInput={fairwayCardInput}
              setPicture={setPicture}
              isLoading={isLoadingMutation}
              isProcessingCurLang={isProcessingCurLang}
              disabled={!fairwayCardInput.id || disabled}
              validationErrors={validationErrors}
              sourceCard={sourceCard}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <NotificationModal
        isOpen={picUploadErrors.length > 0}
        closeAction={() => setPicUploadErrors([])}
        closeTitle={t('general.close')}
        header={t('modal.picture-upload-failed')}
        message={t('modal.picture-errors')}
      />
    </>
  );
};

export default MapExportTool;

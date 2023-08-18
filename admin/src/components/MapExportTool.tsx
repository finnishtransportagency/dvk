import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonProgressBar, IonRow, IonSkeletonText, IonText, useIonViewWillEnter } from '@ionic/react';
import { InitDvkMap, getMap } from './map/DvkMap';
import {
  DvkLayerState,
  useArea12Layer,
  useArea3456Layer,
  useBackgroundBalticseaLayer,
  useBackgroundFinlandLayer,
  useBoardLine12Layer,
  useCircleLayer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useNameLayer,
  usePilotLayer,
  useSafetyEquipmentLayer,
  useSpecialArea15Layer,
  useSpecialArea2Layer,
  useSpeedLimitLayer,
  useVtsLineLayer,
  useVtsPointLayer,
} from './map/FeatureLoader';
import { Fairway, FairwayCardInput, Harbor, Orientation, PictureInput, PictureUploadInput } from '../graphql/generated';
import { fitSelectedFairwayCardOnMap, setSelectedFairwayCard } from './map/layers';
import { useIsFetching } from '@tanstack/react-query';
import './MapExportTool.css';
import { useUploadMapPictureMutationQuery } from '../graphql/api';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, MAP_PIXEL_RATIO, ValidationType, imageUrl } from '../utils/constants';
import HelpModal from './HelpModal';
import ImageModal from './ImageModal';
import infoIcon from '../theme/img/info-circle-solid.svg';
import helpIcon from '../theme/img/help_icon.svg';
import binIcon from '../theme/img/bin.svg';
import LayerModal from './map/mapOverlays/LayerModal';
import { easeOut } from 'ol/easing';

interface PrintInfoProps {
  orientation: Orientation;
}

export const PrintInfo: React.FC<PrintInfoProps> = ({ orientation }) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="printInfo ion-no-padding">
      <IonRow>
        <IonCol size="auto">
          <IonIcon className="infoIcon" icon={infoIcon} />
        </IonCol>
        <IonCol>
          <IonText>{t('fairwaycard.print-images-info-ingress-' + orientation)}</IonText>
          <ol>
            <li>
              {t('fairwaycard.print-images-info-switch')} <span className={'icon orientation-' + orientation} />{' '}
              {t('fairwaycard.print-images-info-select-' + orientation)}
            </li>
            <li>{t('fairwaycard.print-images-info-position-map')}</li>
            <li>
              {t('fairwaycard.print-images-info-take-image')} <span className="icon takeScreenshot" />{' '}
              {t('fairwaycard.print-images-info-set-image-button')}
            </li>
          </ol>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

interface ExtMapControlProps {
  printCurrentMapView: () => void;
  printDisabled?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ExtMapControls: React.FC<ExtMapControlProps> = ({ printCurrentMapView, printDisabled, setIsOpen, isOpen }) => {
  const { t } = useTranslation();
  const dvkMap = getMap();
  const [orientationType, setOrientationType] = useState<Orientation | ''>();

  const handleOrientationChange = (orientation: Orientation) => {
    if (orientation === dvkMap.getOrientationType()) {
      setOrientationType('');
      dvkMap.setOrientationType('');
    } else {
      setOrientationType(orientation);
      dvkMap.setOrientationType(orientation);
    }
  };

  const zoomByDelta = (delta: number) => {
    const map = dvkMap.olMap;
    if (map) {
      const view = map.getView();
      if (!view) {
        // the map does not have a view, so we can't act
        // upon it
        return;
      }
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        const newZoom = view.getConstrainedZoom(currentZoom + delta);

        if (view.getAnimating()) {
          view.cancelAnimations();
        }
        view.animate({
          zoom: newZoom,
          duration: 250,
          easing: easeOut,
        });
      }
    }
  };
  return (
    <div className={'extControls ' + orientationType}>
      <div className="extControl selectPortraitControlContainer">
        <button
          className="selectPortraitControl"
          onClick={(ev) => {
            ev.preventDefault();
            handleOrientationChange(Orientation.Portrait);
          }}
          title={t('homePage.map.controls.orientation.selectPortrait')}
          aria-label={t('homePage.map.controls.orientation.selectPortrait')}
        />
      </div>
      <div className="extControl selectLandscapeControlContainer">
        <button
          className="selectLandscapeControl"
          onClick={(ev) => {
            ev.preventDefault();
            handleOrientationChange(Orientation.Landscape);
          }}
          title={t('homePage.map.controls.orientation.selectLandscape')}
          aria-label={t('homePage.map.controls.orientation.selectLandscape')}
        />
      </div>
      <div className="extControl takeScreenshotControlContainer">
        <button
          className="takeScreenshotControl"
          disabled={!dvkMap.getOrientationType() || printDisabled}
          onClick={(ev) => {
            ev.preventDefault();
            printCurrentMapView();
          }}
          title={t('homePage.map.controls.screenshot.tipLabel')}
          aria-label={t('homePage.map.controls.screenshot.tipLabel')}
        />
      </div>
      <div className="extControl layerControlContainer">
        <button
          className={'layerControlContainer ' + (isOpen ? 'layerControlOpen' : 'layerControl')}
          onClick={(ev) => {
            ev.preventDefault();
            setIsOpen(true);
          }}
          title={t('homePage.map.controls.layer.tipLabel')}
          aria-label={t('homePage.map.controls.layer.tipLabel')}
        />
      </div>
      <div className="extControl centerToOwnLocationControlContainer">
        <button
          className="centerToOwnLocationControl"
          onClick={(ev) => {
            ev.preventDefault();
            fitSelectedFairwayCardOnMap();
          }}
          title={t('homePage.map.controls.features.tipLabel')}
          aria-label={t('homePage.map.controls.features.tipLabel')}
        />
      </div>
      <div className="extControl zoomInControlContainer">
        <button
          className="zoomInControl"
          onClick={(ev) => {
            ev.preventDefault();
            zoomByDelta(1);
          }}
          title={t('homePage.map.controls.zoom.zoomInTipLabel')}
          aria-label={t('homePage.map.controls.zoom.zoomInTipLabel')}
        />
      </div>
      <div className="extControl zoomOutControlContainer">
        <button
          className="zoomOutControl"
          onClick={(ev) => {
            ev.preventDefault();
            zoomByDelta(-1);
          }}
          title={t('homePage.map.controls.zoom.zoomOutTipLabel')}
          aria-label={t('homePage.map.controls.zoom.zoomOutTipLabel')}
        />
      </div>
    </div>
  );
};

interface PrintImageProps {
  fairwayCardInput: FairwayCardInput;
  disabled: boolean;
  setPicture: (
    val: PictureInput[],
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  isLoading?: boolean;
}

const PrintImages: React.FC<PrintImageProps> = ({ fairwayCardInput, setPicture, isLoading, disabled }) => {
  const { t } = useTranslation();
  const dvkMap = getMap();
  const [showOrientationHelp, setShowOrientationHelp] = useState<Orientation | ''>('');
  const [showPicture, setShowPicture] = useState<PictureInput | ''>('');

  const savedPicturesPortrait = fairwayCardInput.pictures?.filter((pic) => pic.orientation === Orientation.Portrait);
  const savedPicturesLandscape = fairwayCardInput.pictures?.filter((pic) => pic.orientation === Orientation.Landscape);

  const toggleSequence = (picture: PictureInput, orientation: Orientation) => {
    const currentPicturesByOrientation = fairwayCardInput.pictures?.filter((pic) => pic.orientation === orientation);
    const currentOtherPictures = fairwayCardInput.pictures?.filter((pic) => pic.orientation !== orientation) ?? [];
    // Check if we need to add or remove the picture from sequence
    let newSequencedPictures: PictureInput[] = [];
    const currentSequenceNumber = picture.sequenceNumber;
    if (currentSequenceNumber) {
      newSequencedPictures =
        currentPicturesByOrientation?.map((pic) => {
          if (pic.id === picture.id) {
            pic.sequenceNumber = null;
          } else if (pic.sequenceNumber && pic.sequenceNumber > currentSequenceNumber) {
            pic.sequenceNumber--;
          }
          return pic;
        }) ?? [];
    } else {
      const sequencedPictures = currentPicturesByOrientation?.filter((pic) => !!pic.sequenceNumber);
      newSequencedPictures =
        currentPicturesByOrientation?.map((pic) => {
          if (pic.id === picture.id) pic.sequenceNumber = (sequencedPictures?.length ?? 0) + 1;
          return pic;
        }) ?? [];
    }
    setPicture(newSequencedPictures.concat(currentOtherPictures), 'picture');
  };

  const deletePicture = (picture: PictureInput) => {
    const picturesExcludingSelected = fairwayCardInput.pictures?.filter((pic) => pic.id !== picture.id) ?? [];
    // If removed picture has a sequence number, reset also the sequence
    const currentSequenceNumber = picture.sequenceNumber;
    const currentOrientation = picture.orientation;
    if (currentSequenceNumber) {
      const newSequencedPictures =
        picturesExcludingSelected?.map((pic) => {
          if (pic.orientation === currentOrientation && pic.sequenceNumber && pic.sequenceNumber > currentSequenceNumber) {
            pic.sequenceNumber--;
          }
          return pic;
        }) ?? [];
      setPicture(newSequencedPictures, 'picture');
    } else {
      setPicture(picturesExcludingSelected, 'picture');
    }
  };

  return (
    <>
      <HelpModal orientation={showOrientationHelp} setIsOpen={setShowOrientationHelp} />
      <ImageModal fairwayCardInput={fairwayCardInput} picture={showPicture} setIsOpen={setShowPicture} />

      <IonText>
        <h4>
          {t('fairwaycard.print-images-portrait')}{' '}
          <IonButton
            slot="end"
            fill="clear"
            className="icon-only xx-small"
            onClick={(ev) => {
              ev.preventDefault();
              setShowOrientationHelp(Orientation.Portrait);
            }}
            title={t('general.show-help') ?? ''}
            aria-label={t('general.show-help') ?? ''}
            disabled={!savedPicturesPortrait?.length}
          >
            <IonIcon icon={helpIcon} />
          </IonButton>
        </h4>
      </IonText>
      <IonGrid className="print-images portraits">
        <IonRow>
          {savedPicturesPortrait?.map((pic) => (
            <IonCol key={pic.id} size="auto">
              <a
                className={'imageWrapper' + (pic.sequenceNumber ? ' selected' : '')}
                href={imageUrl + fairwayCardInput.id + '/' + pic.id}
                onClick={(ev) => {
                  ev.preventDefault();
                  setShowPicture(pic);
                }}
              >
                <img src={imageUrl + fairwayCardInput.id + '/' + pic.id} alt={pic.id} />
                <IonButton
                  slot="end"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggleSequence(pic, Orientation.Portrait);
                  }}
                  fill="clear"
                  disabled={disabled}
                  className={'icon-only sequenceButton' + (pic.sequenceNumber ? ' selected' : '')}
                  title={t('fairwaycard.toggle-sequence') ?? ''}
                  aria-label={t('fairwaycard.toggle-sequence') ?? ''}
                >
                  {pic.sequenceNumber}
                </IonButton>
                <IonButton
                  slot="end"
                  fill="clear"
                  disabled={disabled}
                  className="icon-only x-small deletePicture"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    deletePicture(pic);
                  }}
                  title={t('general.delete') ?? ''}
                  aria-label={t('general.delete') ?? ''}
                >
                  <IonIcon icon={binIcon} />
                </IonButton>
              </a>
              <p>
                <strong>{t('fairwaycard.print-images-modified')}</strong>
                <br />
                {t('general.datetimeFormat', { val: pic.modificationTimestamp })}
              </p>
            </IonCol>
          ))}
          <IonCol size="auto">
            {isLoading && dvkMap.getOrientationType() === Orientation.Portrait && <IonSkeletonText animated={true} />}
            {!savedPicturesPortrait?.length && <PrintInfo orientation={Orientation.Landscape} />}
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonText>
        <h4>
          {t('fairwaycard.print-images-landscape')}{' '}
          <IonButton
            slot="end"
            fill="clear"
            className="icon-only xx-small"
            onClick={(ev) => {
              ev.preventDefault();
              setShowOrientationHelp(Orientation.Landscape);
            }}
            title={t('general.show-help') ?? ''}
            aria-label={t('general.show-help') ?? ''}
            disabled={!savedPicturesLandscape?.length}
          >
            <IonIcon icon={helpIcon} />
          </IonButton>
        </h4>
      </IonText>
      <IonGrid className="print-images landscapes">
        <IonRow>
          {savedPicturesLandscape?.map((pic) => (
            <IonCol key={pic.id} size="auto">
              <a
                className={'imageWrapper' + (pic.sequenceNumber ? ' selected' : '')}
                href={imageUrl + fairwayCardInput.id + '/' + pic.id}
                onClick={(ev) => {
                  ev.preventDefault();
                  setShowPicture(pic);
                }}
              >
                <img src={imageUrl + fairwayCardInput.id + '/' + pic.id} alt={pic.id} />
                <IonButton
                  slot="end"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggleSequence(pic, Orientation.Landscape);
                  }}
                  fill="clear"
                  disabled={disabled}
                  className={'icon-only sequenceButton' + (pic.sequenceNumber ? ' selected' : '')}
                  title={t('fairwaycard.toggle-sequence') ?? ''}
                  aria-label={t('fairwaycard.toggle-sequence') ?? ''}
                >
                  {pic.sequenceNumber}
                </IonButton>
                <IonButton
                  slot="end"
                  fill="clear"
                  disabled={disabled}
                  className="icon-only x-small deletePicture"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    deletePicture(pic);
                  }}
                  title={t('general.delete') ?? ''}
                  aria-label={t('general.delete') ?? ''}
                >
                  <IonIcon icon={binIcon} />
                </IonButton>
              </a>
              <p>
                <strong>{t('fairwaycard.print-images-modified')}</strong>
                <br />
                {t('general.datetimeFormat', { val: pic.modificationTimestamp })}
              </p>
            </IonCol>
          ))}
          <IonCol size="auto">
            {isLoading && dvkMap.getOrientationType() === Orientation.Landscape && <IonSkeletonText animated={true} />}
            {!savedPicturesLandscape?.length && <PrintInfo orientation={Orientation.Landscape} />}
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

interface MapProps {
  fairwayCardInput: FairwayCardInput;
  disabled: boolean;
  fairways?: Fairway[];
  harbours?: Harbor[];
  setPicture: (
    val: PictureInput[],
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors?: ValidationType[];
}

const MapExportTool: React.FC<MapProps> = ({ fairwayCardInput, fairways, harbours, setPicture, validationErrors, disabled }) => {
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
  const circleLayer = useCircleLayer();
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
      circleLayer,
    ];

    let percent = 0;
    const resourcePercentage = 1 / allLayers.length;

    allLayers.forEach(function (layer) {
      if (layer.ready) percent += resourcePercentage;
    });

    setPercentDone(Math.round(percent * 100) / 100);

    setFetchError(allLayers.some((layer) => layer.isError));

    setInitDone(allLayers.every((layer) => layer.ready));
  }, [line12Layer, area12Layer, pilotLayer, harborLayer, boardLine12Layer, bgFinlandLayer, circleLayer, specialArea2Layer, specialArea15Layer]);

  const isFetching = useIsFetching();

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

  // Upload map picture
  const [toBeSavedPicture, setToBeSavedPicture] = useState<(PictureInput & PictureUploadInput) | undefined>();

  const { mutate: uploadMapPictureMutation, isLoading: isLoadingMutation } = useUploadMapPictureMutationQuery({
    onSuccess: () => {
      if (toBeSavedPicture) {
        const newPictureInput = {
          id: toBeSavedPicture.id,
          orientation: dvkMap.getOrientationType() || Orientation.Portrait,
          rotation: toBeSavedPicture.rotation,
          modificationTimestamp: Date.now(),
          scaleWidth: toBeSavedPicture.scaleWidth,
          scaleLabel: toBeSavedPicture.scaleLabel,
          sequenceNumber: null,
          text: null,
          lang: toBeSavedPicture.lang,
        };
        // Update fairwayCard state
        setPicture(fairwayCardInput.pictures?.concat([newPictureInput]) ?? [], 'picture');
      }
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
    onSettled: () => {
      setToBeSavedPicture(undefined);
    },
  });

  const uploadPicture = (base64Data: string, orientation: Orientation, rotation: number, scaleWidth?: string, scaleLabel?: string, lang?: string) => {
    const picUploadObject = {
      base64Data: base64Data.replace('data:image/png;base64,', ''),
      cardId: fairwayCardInput.id,
      contentType: 'image/png',
      id: fairwayCardInput.id + Date.now(),
    };
    const picInputObject = {
      orientation,
      rotation,
      scaleWidth,
      scaleLabel,
      lang,
    };
    setToBeSavedPicture({ ...picUploadObject, ...picInputObject });
    uploadMapPictureMutation({
      picture: picUploadObject,
    });
  };

  // Create uploadable image
  const printCurrentMapView = () => {
    if (dvkMap.olMap && dvkMap.getOrientationType()) {
      const mapScale = dvkMap.olMap?.getViewport().querySelector('.ol-scale-line-inner');
      const mapScaleWidth = mapScale?.getAttribute('style')?.replace(/\D/g, '');
      const rotation = dvkMap.olMap?.getView().getRotation();
      const viewResolution = dvkMap.olMap.getView().getResolution() || 1;

      // Merge canvases to one canvas
      const mapCanvas = document.createElement('canvas');
      const mapSize = dvkMap.olMap?.getSize() ?? [0, 0];
      mapCanvas.width = mapSize[0] * MAP_PIXEL_RATIO;
      mapCanvas.height = mapSize[1] * MAP_PIXEL_RATIO;
      const canvasSizeCropped = dvkMap.getCanvasDimensions();

      const scaling = Math.min(mapCanvas.width / canvasSizeCropped[0], mapCanvas.height / canvasSizeCropped[1]);
      //dvkMap.olMap.getView().setResolution(viewResolution / scaling);
      console.log(viewResolution, scaling, viewResolution / scaling);

      const mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(dvkMap.olMap?.getViewport().querySelectorAll('.ol-layer canvas'), function (canvas) {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
          if (mapContext) mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          let matrix;
          const transform = canvas.style.transform;
          if (transform) {
            // Get the transform parameters from the style's transform matrix
            matrix = transform
              .match(/^matrix\(([^(]*)\)$/)[1]
              .split(',')
              .map(Number);
          } else {
            matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
          }
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
          const backgroundColor = canvas.parentNode.style.backgroundColor;
          if (backgroundColor && mapContext) {
            mapContext.fillStyle = backgroundColor;
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
          }
          if (mapContext) mapContext.drawImage(canvas, 0, 0);
        }
      });
      if (mapContext) {
        mapContext.globalAlpha = 1;
        mapContext.setTransform(1, 0, 0, 1, 0, 0);
      }

      // Crop the canvas and create image
      const mapCanvasCropped = document.createElement('canvas');
      mapCanvasCropped.width = canvasSizeCropped[0];
      mapCanvasCropped.height = canvasSizeCropped[1];
      const mapContextCropped = mapCanvasCropped.getContext('2d');
      if (mapContextCropped) {
        mapContextCropped.drawImage(
          mapCanvas,
          (mapSize[0] * MAP_PIXEL_RATIO - mapCanvasCropped.width) / 2,
          (mapSize[1] * MAP_PIXEL_RATIO - mapCanvasCropped.height) / 2,
          mapCanvasCropped.width,
          mapCanvasCropped.height,
          0,
          0,
          mapCanvasCropped.width * MAP_PIXEL_RATIO,
          mapCanvasCropped.height * MAP_PIXEL_RATIO
        );
      }
      const base64Data = mapCanvasCropped.toDataURL('image/png');
      uploadPicture(base64Data, dvkMap.getOrientationType() || Orientation.Portrait, rotation, mapScaleWidth, mapScale?.innerHTML, 'fi');
      // Reset original map size
      //dvkMap.olMap?.setSize(mapSize);
      //dvkMap.olMap?.getView().setResolution(viewResolution);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <IonGrid className="mapExportTool">
      <IonRow>
        <IonCol>
          <LayerModal isOpen={isOpen} setIsOpen={setIsOpen} />
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
            printDisabled={
              isLoadingMutation || !fairwayCardInput.id || disabled || !!validationErrors?.find((error) => error.id === 'primaryId')?.msg
            }
          />
          <div className="mainMapWrapper" ref={mapElement} data-testid="mapElement"></div>
        </IonCol>
        <IonCol>
          <PrintImages fairwayCardInput={fairwayCardInput} setPicture={setPicture} isLoading={isLoadingMutation} disabled={disabled} />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default MapExportTool;

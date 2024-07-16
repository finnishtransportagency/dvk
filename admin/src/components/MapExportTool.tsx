import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonProgressBar, IonRow, IonSkeletonText, IonText, useIonViewWillEnter } from '@ionic/react';
import { InitDvkMap, getMap } from './map/DvkMap';
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
} from './map/FeatureLoader';
import { Fairway, FairwayCardInput, Harbor, Orientation, PictureInput, PictureUploadInput } from '../graphql/generated';
import { fitSelectedFairwayCardOnMap, setSelectedFairwayCard } from './map/layers';
import { useIsFetching } from '@tanstack/react-query';
import './MapExportTool.css';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, POSITION, PictureGroup, ValidationType, ValueType, imageUrl, locales } from '../utils/constants';
import HelpModal from './HelpModal';
import ImageModal from './ImageModal';
import helpIcon from '../theme/img/help_icon.svg';
import binIcon from '../theme/img/bin.svg';
import back_arrow from '../theme/img/back_arrow-1.svg';
import LayerModal from './map/mapOverlays/LayerModal';
import { easeOut } from 'ol/easing';
import Alert from './Alert';
import TextInputRow from './form/TextInputRow';
import { addSequence, radiansToDegrees, removeSequence } from '../utils/common';
import FileUploader from '../utils/FileUploader';
import infoIcon from '../theme/img/info-circle-solid.svg';
import NotificationModal from './NotificationModal';
import {
  getExportMapBase64Data,
  getMapCanvas,
  processCanvasElements,
  resetMapProperties,
  setMapProperties,
  useUploadMapPictureMutation,
} from '../utils/mapExportToolUtils';
import { usePilotRouteLayer } from './map/PilotRouteFeatureLoader';

interface PrintInfoProps {
  orientation: Orientation;
  isFull?: boolean;
}

export const PrintInfo: React.FC<PrintInfoProps> = ({ orientation, isFull }) => {
  const { t } = useTranslation();

  return (
    <Alert
      alertType="info"
      text={
        (isFull ? t('fairwaycard.print-images-info-ingress-1-' + orientation) + ' ' : '') +
        t('fairwaycard.print-images-info-ingress-2-' + orientation)
      }
      extraClass="printInfo"
    >
      <ol>
        <li>
          {t('fairwaycard.print-images-info-switch')} <span className={'icon orientation-' + orientation} />{' '}
          {t('fairwaycard.print-images-info-select-' + orientation)}
        </li>
        <li>
          {t('fairwaycard.print-images-info-select-layers')} <span className="icon layers" />{' '}
          {t('fairwaycard.print-images-info-select-layers-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-position-map')} {t('fairwaycard.print-images-info-target-by-features')} <span className="icon target" />{' '}
          {t('fairwaycard.print-images-info-target-by-features-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-take-image')} <span className="icon takeScreenshot" />{' '}
          {t('fairwaycard.print-images-info-set-image-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-select-image')} <span className="icon select-image" />{' '}
          {t('fairwaycard.print-images-info-select-image-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-upload-image')} <span className="icon uploadPicture" />{' '}
          {orientation === Orientation.Portrait
            ? t('fairwaycard.print-images-info-upload-image-button-portrait')
            : t('fairwaycard.print-images-info-upload-image-button-landscape')}
        </li>
      </ol>
    </Alert>
  );
};

interface ExtMapControlProps {
  printCurrentMapView: () => void;
  printDisabled?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fileUploader: FileUploader;
  importExternalImage: () => void;
  setErrors: Dispatch<SetStateAction<string[]>>;
}

const ExtMapControls: React.FC<ExtMapControlProps> = ({
  printCurrentMapView,
  printDisabled,
  setIsOpen,
  isOpen,
  fileUploader,
  importExternalImage,
  setErrors,
}) => {
  const { t } = useTranslation();
  const dvkMap = getMap();
  const [orientationType, setOrientationType] = useState<Orientation | ''>(dvkMap.getOrientationType());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePictureUpload = (event: ChangeEvent) => {
    const fileErrors = fileUploader.addPicture(event);
    if (fileErrors.length > 0) {
      setErrors(fileErrors);
    }

    importExternalImage();
    //so duplicates can be added
    (event.target as HTMLInputElement).value = '';
  };

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
      <div className="extControl uploadPictureControlContainer">
        <button
          className="uploadPictureControl"
          type="button"
          disabled={!dvkMap.getOrientationType()}
          onClick={() => {
            fileInputRef.current?.click();
          }}
          title={t('homePage.map.controls.upload.uploadPicture')}
          aria-label={t('homePage.map.controls.upload.uploadPicture')}
        >
          <input
            id="fileInput"
            type="file"
            ref={fileInputRef}
            disabled={!dvkMap.getOrientationType()}
            onChange={handlePictureUpload}
            accept="image/png"
            style={{ display: 'none' }}
          />
        </button>
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

interface PrintImagesByModeProps {
  fairwayCardInput: FairwayCardInput;
  setPicture: (
    val: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  orientation: Orientation;
  disabled: boolean;
  setShowPicture: (picture: PictureInput | '') => void;
  isLoading?: boolean;
  isProcessingCurLang?: boolean;
  validationErrors?: ValidationType[];
}

const PrintImagesByMode: React.FC<PrintImagesByModeProps> = ({
  fairwayCardInput,
  setPicture,
  orientation,
  disabled,
  setShowPicture,
  isLoading,
  isProcessingCurLang,
  validationErrors,
}) => {
  const { t, i18n } = useTranslation();
  const curLang = i18n.resolvedLanguage as Lang;

  const dvkMap = getMap();

  const mainPictures = fairwayCardInput.pictures?.filter((pic) => pic.orientation === orientation && (pic.lang === curLang || !pic.lang));
  const secondaryPictures = fairwayCardInput.pictures?.filter((pic) => pic.orientation === orientation && pic.lang !== curLang);
  const groupedPicTexts: PictureGroup[] = [];
  fairwayCardInput.pictures?.map((pic) => {
    if (pic.groupId && !groupedPicTexts.some((p) => p.groupId === pic.groupId)) {
      const currentGroup = fairwayCardInput?.pictures?.filter((p) => p.groupId === pic.groupId);
      groupedPicTexts.push({
        groupId: pic.groupId,
        text: {
          fi: currentGroup?.find((p) => p.lang === 'fi')?.text ?? '',
          sv: currentGroup?.find((p) => p.lang === 'sv')?.text ?? '',
          en: currentGroup?.find((p) => p.lang === 'en')?.text ?? '',
        },
      });
    }
  });

  const toggleSequence = (picture: PictureInput) => {
    const currentPicturesByOrientation = fairwayCardInput.pictures?.filter((pic) => pic.orientation === orientation) ?? [];
    const currentOtherPictures = fairwayCardInput.pictures?.filter((pic) => pic.orientation !== orientation) ?? [];
    // Check if we need to add or remove the picture from sequence
    const currentSequenceNumber = picture.sequenceNumber;
    const newSequencedPictures = currentSequenceNumber
      ? removeSequence(picture, currentPicturesByOrientation, currentSequenceNumber)
      : addSequence(picture, currentPicturesByOrientation);
    setPicture([...newSequencedPictures, ...currentOtherPictures] as PictureInput[], 'picture');
  };

  const deletePicture = (picture: PictureInput) => {
    const picturesExcludingSelected =
      fairwayCardInput.pictures?.filter((pic) => {
        if (picture.groupId && pic.groupId === picture.groupId) return false;
        if (pic.id === picture.id) return false;
        return true;
      }) ?? [];
    // If removed picture has a sequence number, reset also the sequence
    const currentSequenceNumber = picture.sequenceNumber;
    const currentOrientation = picture.orientation;
    if (currentSequenceNumber) {
      const newSequencedPictures =
        picturesExcludingSelected.map((pic) => {
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
    <IonGrid className={'print-images ' + orientation.toLowerCase()}>
      <IonRow>
        {mainPictures?.map((pic, idx) => {
          const groupedPics = secondaryPictures?.filter((p) => p.groupId && p.groupId === pic.groupId);
          return (
            <IonCol key={pic.id} size="auto">
              <IonGrid className="picWrapper">
                <IonRow>
                  <IonCol size="auto">
                    <a
                      className={'picLink' + (pic.sequenceNumber ? ' selected' : '')}
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
                          toggleSequence(pic);
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
                    <IonGrid className="ion-no-padding groupedPics">
                      <IonRow className="ion-justify-content-evenly">
                        {groupedPics?.map((groupedPic) => (
                          <IonCol key={groupedPic.id + groupedPic.groupId} size="auto">
                            <a
                              className={'picLink' + (pic.sequenceNumber ? ' selected' : '')}
                              href={imageUrl + fairwayCardInput.id + '/' + groupedPic.id}
                              onClick={(ev) => {
                                ev.preventDefault();
                                setShowPicture(groupedPic);
                              }}
                            >
                              <img src={imageUrl + fairwayCardInput.id + '/' + groupedPic.id} alt={groupedPic.id} className="small" />
                            </a>
                          </IonCol>
                        ))}
                        {isLoading && !isProcessingCurLang && dvkMap.getOrientationType() === orientation && idx === mainPictures.length - 1 && (
                          <IonCol size="auto">
                            <IonSkeletonText animated={true} className="pic small" />
                          </IonCol>
                        )}
                      </IonRow>
                    </IonGrid>
                  </IonCol>
                  <IonCol>
                    <p>
                      <strong>{t('fairwaycard.print-images-modified')}</strong>
                      <br />
                      {t('general.datetimeFormat', { val: pic.modificationTimestamp })}
                    </p>
                    <p>
                      <strong>{t('fairwaycard.print-images-language')}</strong>
                      <br />
                      {t(`fairwaycard.print-images-language-${pic.lang}`)}
                      {groupedPics && groupedPics?.length > 0 && (
                        <>, {groupedPics.flatMap((gPic) => t(`fairwaycard.print-images-language-${gPic.lang}`)).join(', ')}</>
                      )}
                      {isLoading && !isProcessingCurLang && dvkMap.getOrientationType() === orientation && idx === mainPictures.length - 1 && (
                        <IonSkeletonText animated={true} className="text inline" />
                      )}
                    </p>
                    <p>
                      <strong>{t('fairwaycard.print-images-rotation')}</strong>
                      <br />
                      {pic.rotation !== null ? (
                        <>
                          {radiansToDegrees(pic.rotation ?? 0)} °{' '}
                          <img
                            className="orientation"
                            src={back_arrow}
                            alt=""
                            style={{ transform: 'rotate(' + pic.rotation?.toPrecision(2) + 'rad)' }}
                          />
                        </>
                      ) : (
                        <IonCol>
                          <IonIcon className="infoIcon" icon={infoIcon} />
                          <span className="infoText">{t('general.noDataSet')}</span>
                        </IonCol>
                      )}
                    </p>
                    {groupedPics && groupedPics?.length > 0 && (
                      <IonGrid className="formGrid">
                        <TextInputRow
                          labelKey="fairwaycard.print-images-description"
                          value={groupedPicTexts?.find((gPic) => gPic.groupId === pic.groupId)?.text}
                          updateState={setPicture}
                          actionType="pictureDescription"
                          actionTarget={pic.groupId ?? ''}
                          required={!!pic.text || !!groupedPics?.filter((gPic) => gPic.text).length}
                          disabled={false}
                          error={
                            pic.text || groupedPics?.filter((gPic) => gPic.text).length
                              ? validationErrors?.find((error) => error.id === 'pictureText-' + pic.groupId)?.msg
                              : undefined
                          }
                          maxCharLength={100}
                        />
                      </IonGrid>
                    )}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
          );
        })}
        <IonCol size="auto">
          {isLoading && isProcessingCurLang && dvkMap.getOrientationType() === orientation && (
            <IonGrid className="picWrapper">
              <IonRow>
                <IonCol>
                  <IonSkeletonText animated={true} className="pic" />
                  <IonGrid className="ion-no-padding groupedPics">
                    <IonRow className="ion-justify-content-evenly">
                      {locales
                        .filter((l) => l !== curLang)
                        .map((locale) => (
                          <IonCol key={locale} size="auto">
                            <IonSkeletonText animated={true} className="pic small" />
                          </IonCol>
                        ))}
                    </IonRow>
                  </IonGrid>
                </IonCol>
                <IonCol>
                  <p>
                    <strong>{t('fairwaycard.print-images-modified')}</strong>
                    <br />
                    <IonSkeletonText animated={true} className="text" />
                  </p>
                  <p>
                    <strong>{t('fairwaycard.print-images-language')}</strong>
                    <br />
                    <IonSkeletonText animated={true} className="text" />
                  </p>
                  <p>
                    <strong>{t('fairwaycard.print-images-rotation')}</strong>
                    <br />
                    <IonSkeletonText animated={true} className="text" />
                  </p>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}
          {!mainPictures?.length && !isLoading && <PrintInfo orientation={orientation} isFull />}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

interface PrintImageProps {
  fairwayCardInput: FairwayCardInput;
  disabled: boolean;
  setPicture: (
    val: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  isLoading?: boolean;
  validationErrors?: ValidationType[];
  isProcessingCurLang?: boolean;
}

const PrintImages: React.FC<PrintImageProps> = ({ fairwayCardInput, setPicture, isLoading, disabled, validationErrors, isProcessingCurLang }) => {
  const { t, i18n } = useTranslation();
  const curLang = i18n.resolvedLanguage as Lang;
  const dvkMap = getMap();

  const [showOrientationHelp, setShowOrientationHelp] = useState<Orientation | ''>('');
  const [showPicture, setShowPicture] = useState<PictureInput | ''>('');

  const savedPicturesPortrait = fairwayCardInput.pictures?.filter(
    (pic) => pic.orientation === Orientation.Portrait && (pic.lang === curLang || !pic.lang)
  );
  const savedPicturesLandscape = fairwayCardInput.pictures?.filter(
    (pic) => pic.orientation === Orientation.Landscape && (pic.lang === curLang || !pic.lang)
  );
  return (
    <>
      <HelpModal orientation={showOrientationHelp} setIsOpen={setShowOrientationHelp} />
      <ImageModal fairwayCardInput={fairwayCardInput} picture={showPicture} setIsOpen={setShowPicture} setPicture={setPicture} />

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
      <PrintImagesByMode
        fairwayCardInput={fairwayCardInput}
        setPicture={setPicture}
        orientation={Orientation.Portrait}
        disabled={disabled}
        setShowPicture={setShowPicture}
        isLoading={dvkMap.getOrientationType() === Orientation.Portrait && isLoading}
        isProcessingCurLang={isProcessingCurLang}
        validationErrors={validationErrors}
      />

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
      <PrintImagesByMode
        fairwayCardInput={fairwayCardInput}
        setPicture={setPicture}
        orientation={Orientation.Landscape}
        disabled={disabled}
        setShowPicture={setShowPicture}
        isLoading={dvkMap.getOrientationType() === Orientation.Landscape && isLoading}
        isProcessingCurLang={isProcessingCurLang}
        validationErrors={validationErrors}
      />
    </>
  );
};

interface MapProps {
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
}

const MapExportTool: React.FC<MapProps> = ({ fairwayCardInput, fairways, harbours, setPicture, validationErrors, disabled }) => {
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
              disabled={disabled}
              validationErrors={validationErrors}
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

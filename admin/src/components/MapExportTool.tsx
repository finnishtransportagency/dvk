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
import { ActionType, Lang, MAP, PictureGroup, ValidationType, ValueType, imageUrl, locales } from '../utils/constants';
import HelpModal from './HelpModal';
import ImageModal from './ImageModal';
import helpIcon from '../theme/img/help_icon.svg';
import binIcon from '../theme/img/bin.svg';
import back_arrow from '../theme/img/back_arrow-1.svg';
import LayerModal from './map/mapOverlays/LayerModal';
import { easeOut } from 'ol/easing';
import Alert from './Alert';
import FormTextInputRow from './FormTextInputRow';
import { radiansToDegrees } from '../utils/common';

interface PrintInfoProps {
  orientation: Orientation;
}

export const PrintInfo: React.FC<PrintInfoProps> = ({ orientation }) => {
  const { t } = useTranslation();

  return (
    <Alert alertType="info" text={t('fairwaycard.print-images-info-ingress-' + orientation)} extraClass="printInfo">
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
      </ol>
    </Alert>
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
  const [orientationType, setOrientationType] = useState<Orientation | ''>(dvkMap.getOrientationType());

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
  validationErrors?: ValidationType[];
}

const PrintImagesByMode: React.FC<PrintImagesByModeProps> = ({
  fairwayCardInput,
  setPicture,
  orientation,
  disabled,
  setShowPicture,
  isLoading,
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
    const currentPicturesByOrientation = fairwayCardInput.pictures?.filter((pic) => pic.orientation === orientation);
    const currentOtherPictures = fairwayCardInput.pictures?.filter((pic) => pic.orientation !== orientation) ?? [];
    // Check if we need to add or remove the picture from sequence
    let newSequencedPictures: PictureInput[] = [];
    const currentSequenceNumber = picture.sequenceNumber;
    if (currentSequenceNumber) {
      newSequencedPictures =
        currentPicturesByOrientation?.map((pic) => {
          if (pic.id === picture.id || (picture.groupId && pic.groupId === picture.groupId)) {
            pic.sequenceNumber = null;
          } else if (pic.sequenceNumber && pic.sequenceNumber > currentSequenceNumber) {
            pic.sequenceNumber--;
          }
          return pic;
        }) ?? [];
    } else {
      const sequencedPictures = currentPicturesByOrientation?.filter((pic) => !!pic.sequenceNumber);
      const maxSequenceNumber = sequencedPictures?.reduce((acc, pic) => {
        return (acc = acc > (pic.sequenceNumber ?? 0) ? acc : pic.sequenceNumber ?? 0);
      }, 0);
      newSequencedPictures =
        currentPicturesByOrientation?.map((pic) => {
          if (pic.id === picture.id || (picture.groupId && pic.groupId === picture.groupId)) pic.sequenceNumber = (maxSequenceNumber ?? 0) + 1;
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
        picturesExcludingSelected
          ?.filter((pic) => pic.groupId !== picture.groupId && pic.sequenceNumber !== currentSequenceNumber)
          .map((pic) => {
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
        {mainPictures?.map((pic) => {
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
                    </p>
                    <p>
                      <strong>{t('fairwaycard.print-images-rotation')}</strong>
                      <br />
                      {radiansToDegrees(pic.rotation ?? 0)} °{' '}
                      <img className="orientation" src={back_arrow} alt="" style={{ transform: 'rotate(' + pic.rotation?.toPrecision(2) + 'rad)' }} />
                    </p>
                    {groupedPics && groupedPics?.length > 0 && (
                      <IonGrid className="formGrid">
                        <FormTextInputRow
                          labelKey="fairwaycard.print-images-description"
                          value={groupedPicTexts?.find((gPic) => gPic.groupId === pic.groupId)?.text}
                          updateState={setPicture}
                          actionType="pictureDescription"
                          actionTarget={pic.groupId ?? ''}
                          required={!!(pic.text || groupedPics?.filter((gPic) => gPic.text).length)}
                          disabled={false}
                          error={
                            pic.text || groupedPics?.filter((gPic) => gPic.text).length
                              ? validationErrors?.find((error) => error.id === 'pictureText-' + pic.groupId)?.msg
                              : undefined
                          }
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
          {isLoading && dvkMap.getOrientationType() === orientation && (
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
          {!mainPictures?.length && !isLoading && <PrintInfo orientation={orientation} />}
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
}

const PrintImages: React.FC<PrintImageProps> = ({ fairwayCardInput, setPicture, isLoading, disabled, validationErrors }) => {
  const { t, i18n } = useTranslation();
  const curLang = i18n.resolvedLanguage as Lang;

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
      <PrintImagesByMode
        fairwayCardInput={fairwayCardInput}
        setPicture={setPicture}
        orientation={Orientation.Portrait}
        disabled={disabled}
        setShowPicture={setShowPicture}
        isLoading={isLoading}
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
        isLoading={isLoading}
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
  const { t } = useTranslation();

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
  const hasPrimaryIdError = !fairwayCardInput.id || (validationErrors?.filter((error) => error.id === 'primaryId' && error.msg) ?? []).length > 0;
  const [isMapDisabled, setIsMapDisabled] = useState(hasPrimaryIdError || disabled);

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

  const { mutateAsync: uploadMapPictureMutation, isLoading: isLoadingMutation } = useUploadMapPictureMutationQuery({
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
          groupId: toBeSavedPicture.groupId,
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

  const uploadPicture = async (
    base64Data: string,
    orientation: Orientation,
    rotation: number,
    groupId: number,
    scaleWidth?: string,
    scaleLabel?: string,
    lang?: string
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
    };
    setToBeSavedPicture({ ...picUploadObject, ...picInputObject });
    await uploadMapPictureMutation({
      picture: picUploadObject,
    });
  };

  const exportMapByLang = (viewResolution: number, rotation: number, lang: Lang, picGroupId: number): Promise<string> => {
    return new Promise((resolve) => {
      if (dvkMap.olMap && dvkMap.getOrientationType()) {
        // Merge canvases to one canvas
        const mapCanvas = document.createElement('canvas');
        const mapSize = dvkMap.olMap?.getSize() ?? [0, 0];
        mapCanvas.width = mapSize[0] * MAP.PRINT.SCALE;
        mapCanvas.height = mapSize[1] * MAP.PRINT.SCALE;
        const canvasSizeCropped = dvkMap.getCanvasDimensions();

        dvkMap.olMap.getView().setResolution(viewResolution / MAP.PRINT.SCALE);
        dvkMap.olMap.setSize([mapSize[0] * MAP.PRINT.SCALE, mapSize[1] * MAP.PRINT.SCALE]);
        dvkMap.setMapLanguage(lang);

        dvkMap.olMap.once('rendercomplete', async function () {
          const mapScale = dvkMap.olMap?.getViewport().querySelector('.ol-scale-line-inner');
          const mapScaleWidth = mapScale?.getAttribute('style')?.replace(/\D/g, '');
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
          const base64Data = mapCanvasCropped.toDataURL('image/png');
          await uploadPicture(
            base64Data,
            dvkMap.getOrientationType() || Orientation.Portrait,
            rotation,
            picGroupId,
            mapScaleWidth,
            mapScale?.innerHTML,
            lang
          );
          // Reset original map properties
          dvkMap.setMapLanguage('');
          dvkMap.olMap?.setSize(mapSize);
          dvkMap.olMap?.getView().setResolution(viewResolution);
          dvkMap.olMap?.once('rendercomplete', function () {
            resolve(`Map export for locale ${lang} done.`);
          });
        });
      } else {
        Promise.reject(`Map export for locale ${lang} failed.`);
      }
    });
  };

  // Create uploadable image
  const printCurrentMapView = async () => {
    console.time('Export pictures');
    if (dvkMap.olMap && dvkMap.getOrientationType()) {
      setIsMapDisabled(true);

      const rotation = dvkMap.olMap.getView().getRotation();
      const viewResolution = dvkMap.olMap.getView().getResolution() ?? 1;
      const picGroupId = Date.now();

      for (const locale of locales) {
        await exportMapByLang(viewResolution, rotation, locale as Lang, picGroupId);
      }

      setIsMapDisabled(false);
    }
    console.timeEnd('Export pictures');
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
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
          />
          <div className="mainMapWrapper" ref={mapElement} data-testid="mapElement"></div>
        </IonCol>
        <IonCol>
          <PrintImages
            fairwayCardInput={fairwayCardInput}
            setPicture={setPicture}
            isLoading={isLoadingMutation}
            disabled={disabled}
            validationErrors={validationErrors}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default MapExportTool;

import React from 'react';
import { IonGrid, IonRow, IonCol, IonButton, IonIcon, IonSkeletonText } from '@ionic/react';
import { radiansToDegrees } from '@turf/helpers';
import { useTranslation } from 'react-i18next';
import { FairwayCardInput, Orientation, PictureInput } from '../../graphql/generated';
import { removeSequence, addSequence } from '../../utils/common';
import { ValueType, ActionType, Lang, ValidationType, PictureGroup, imageUrl, locales } from '../../utils/constants';
import TextInputRow from '../form/TextInputRow';
import { getMap } from '../map/DvkMap';
import { PrintInfo } from './PrintInfo';
import binIcon from '../../theme/img/bin.svg';
import infoIcon from '../../theme/img/info-circle-solid.svg';
import back_arrow from '../../theme/img/back_arrow-1.svg';

interface PrintImagesByModeProps {
  fairwayCardInput: FairwayCardInput;
  updateState: (
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
  readonly?: boolean;
}

export const PrintImagesByMode: React.FC<PrintImagesByModeProps> = ({
  fairwayCardInput,
  updateState,
  orientation,
  disabled,
  readonly = false,
  setShowPicture,
  isLoading,
  isProcessingCurLang,
  validationErrors,
}) => {
  const { t, i18n } = useTranslation();
  const curLang = i18n.resolvedLanguage as Lang;
  const dvkMap = getMap();

  const previewDisabled = !fairwayCardInput.id;

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
    updateState([...newSequencedPictures, ...currentOtherPictures] as PictureInput[], 'picture');
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
      updateState(newSequencedPictures, 'picture');
    } else {
      updateState(picturesExcludingSelected, 'picture');
    }
  };

  const cardId = fairwayCardInput.id;
  const cardVersion = fairwayCardInput.version;

  return (
    <IonGrid className={'print-images ' + orientation.toLowerCase()}>
      <IonRow>
        {mainPictures?.map((pic, idx) => {
          const groupedPics = secondaryPictures?.filter((p) => p.groupId && p.groupId === pic.groupId);
          const imgSource = `${imageUrl}${cardId}/${cardVersion}/`;

          return (
            <IonCol key={pic.id} size="auto">
              <IonGrid className="picWrapper">
                <IonRow>
                  <IonCol size="auto">
                    <a
                      className={`picLink${pic.sequenceNumber ? ' selected' : ''}${previewDisabled ? ' disabled' : ''}`}
                      href={imgSource + pic.id}
                      onClick={(ev) => {
                        ev.preventDefault();
                        setShowPicture(pic);
                      }}
                    >
                      <img src={imgSource + pic.id} alt={pic.id} />
                      <IonButton
                        slot="end"
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          toggleSequence(pic);
                        }}
                        fill="clear"
                        disabled={readonly || previewDisabled || disabled}
                        className={'icon-only sequenceButton' + (pic.sequenceNumber ? ' selected' : '')}
                        title={t('fairwaycard.toggle-sequence') ?? ''}
                        aria-label={t('fairwaycard.toggle-sequence') ?? ''}
                      >
                        {pic.sequenceNumber}
                      </IonButton>
                      <IonButton
                        slot="end"
                        fill="clear"
                        disabled={readonly || previewDisabled || disabled}
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
                              className={`picLink${pic.sequenceNumber ? ' selected' : ''}${previewDisabled ? ' disabled' : ''}`}
                              href={imgSource + groupedPic.id}
                              onClick={(ev) => {
                                ev.preventDefault();
                                setShowPicture(groupedPic);
                              }}
                            >
                              <img src={imgSource + groupedPic.id} alt={groupedPic.id} className="small" />
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
                      {pic.modificationTimestamp ? t('general.datetimeFormat', { val: pic.modificationTimestamp }) : '-'}
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
                          {radiansToDegrees(pic.rotation ?? 0)}°{' '}
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
                          updateState={updateState}
                          actionType="pictureDescription"
                          actionTarget={pic.groupId ?? ''}
                          required={!!pic.text || !!groupedPics?.filter((gPic) => gPic.text).length}
                          disabled={previewDisabled || disabled}
                          readonly={readonly}
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

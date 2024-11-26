import React, { useState } from 'react';
import { IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardInput, Orientation, PictureInput } from '../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType } from '../../utils/constants';
import HelpModal from '../HelpModal';
import ImageModal from '../ImageModal';
import { getMap } from '../map/DvkMap';
import { PrintImagesByMode } from './PrintImagesByMode';
import helpIcon from '../../theme/img/help_icon.svg';

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
  readonly?: boolean;
}

export const PrintImages: React.FC<PrintImageProps> = ({
  fairwayCardInput,
  setPicture,
  isLoading,
  disabled,
  readonly = false,
  validationErrors,
  isProcessingCurLang,
}) => {
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
      <ImageModal fairwayCardInput={fairwayCardInput} picture={showPicture} setIsOpen={setShowPicture} setPicture={setPicture} disabled={disabled} />

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
            disabled={readonly || !fairwayCardInput.id || !savedPicturesPortrait?.length}
          >
            <IonIcon icon={helpIcon} />
          </IonButton>
        </h4>
      </IonText>
      <PrintImagesByMode
        fairwayCardInput={fairwayCardInput}
        setPicture={setPicture}
        orientation={Orientation.Portrait}
        readonly={readonly}
        disabled={readonly || disabled}
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
            disabled={readonly || !fairwayCardInput.id || !savedPicturesLandscape?.length}
          >
            <IonIcon icon={helpIcon} />
          </IonButton>
        </h4>
      </IonText>
      <PrintImagesByMode
        fairwayCardInput={fairwayCardInput}
        setPicture={setPicture}
        orientation={Orientation.Landscape}
        readonly={readonly}
        disabled={readonly || disabled}
        setShowPicture={setShowPicture}
        isLoading={dvkMap.getOrientationType() === Orientation.Landscape && isLoading}
        isProcessingCurLang={isProcessingCurLang}
        validationErrors={validationErrors}
      />
    </>
  );
};

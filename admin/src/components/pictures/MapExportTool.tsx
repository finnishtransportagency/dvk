import React, { useEffect, useState } from 'react';
import { IonCol, IonGrid, IonProgressBar, IonRow } from '@ionic/react';
import { getMap } from '../map/DvkMap';
import { Fairway, FairwayCardInput, Harbor, Orientation, PictureInput, PictureUploadInput } from '../../graphql/generated';
import { setSelectedFairwayCard } from '../map/fairwayCardSetter';
import { useIsFetching } from '@tanstack/react-query';
import './MapExportTool.css';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, ValidationType, ValueType, locales } from '../../utils/constants';
import LayerModal from '../map/mapOverlays/LayerModal';
import Alert from '../Alert';
import FileUploader from '../../utils/FileUploader';
import NotificationModal from '../NotificationModal';
import { exportMapByLang, uploadPicture, useUploadMapPictureMutation } from '../../utils/mapExportToolUtils';
import { ExtMapControls } from './ExtMapControls';
import { PrintImages } from './PrintImages';
import MapElement from './MapElement';

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
  readonly?: boolean;
}

const MapExportTool: React.FC<MapExportToolProps> = ({ fairwayCardInput, fairways, harbours, setPicture, validationErrors, disabled, readonly }) => {
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

  const [initDone, setInitDone] = useState(false);
  const [percentDone, setPercentDone] = useState(0);
  const [fetchError, setFetchError] = useState(false);

  const dvkMap = getMap();

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
        await exportMapByLang(
          fairwayCardInput,
          uploadMapPictureMutation,
          setNewPicture,
          dvkMap,
          viewResolution,
          rotation,
          locale as Lang,
          picGroupId
        );
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
            await uploadPicture(
              fairwayCardInput,
              uploadMapPictureMutation,
              setNewPicture,
              base64Data as string,
              dvkMap.getOrientationType() || Orientation.Portrait,
              picGroupId,
              locale as Lang
            );
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
                aria-hidden="true"
              />
            )}
            <ExtMapControls
              printCurrentMapView={printCurrentMapView}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              printDisabled={readonly || isLoadingMutation || isMapDisabled}
              fileUploader={fileUploader}
              importExternalImage={importExternalImage}
              setErrors={setPicUploadErrors}
            />
            <MapElement setInitDone={setInitDone} setPercentDone={setPercentDone} setFetchError={setFetchError} />
          </IonCol>
          <IonCol>
            <PrintImages
              fairwayCardInput={fairwayCardInput}
              setPicture={setPicture}
              isLoading={isLoadingMutation}
              isProcessingCurLang={isProcessingCurLang}
              readonly={readonly}
              disabled={!readonly && disabled}
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

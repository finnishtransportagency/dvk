import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ConfirmationType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
import {
  ContentType,
  FairwayCardByIdFragment,
  FairwayCardInput,
  Operation,
  Status,
  TemporaryNotificationInput,
  TugInput,
  VtsInput,
} from '../graphql/generated';
import {
  useFairwayCardLatestByIdQueryData,
  useFairwayCardsAndHarborsQueryData,
  useFairwaysQueryData,
  useHarboursQueryData,
  useMareographQueryData,
  usePilotPlacesQueryData,
  useSaveFairwayCardMutationQuery,
} from '../graphql/api';
import Section from './form/Section';
import { fairwayCardReducer } from '../utils/fairwayCardReducer';
import ConfirmationModal, { StatusName } from './ConfirmationModal';
import { useHistory } from 'react-router';
import NotificationModal from './NotificationModal';
import MapExportTool from './pictures/MapExportTool';
import { mapNewFairwayCardVersion, mapToFairwayCardInput } from '../utils/dataMapper';
import { hasUnsavedChanges, validateFairwayCardForm } from '../utils/formValidations';
import MainSection from './form/fairwayCard/MainSection';
import FairwaySection from './form/fairwayCard/FairwaySection';
import NavigationSection from './form/fairwayCard/NavigationSection';
import RecommendationsSection from './form/fairwayCard/RecommendationsSection';
import TrafficServiceSection from './form/fairwayCard/TrafficServiceSection';
import Header from './form/Header';
import { openPreview } from '../utils/common';
import AdditionalInfoSection from './form/fairwayCard/AdditionalInfoSection';
import { useFeatureData } from '../utils/dataLoader';
import NotificationSection from './form/fairwayCard/NotificationSection';
import InfoHeader, { InfoHeaderProps } from './InfoHeader';
import PublishModal from './PublishModal';
import PublishDetailsSection from './form/PublishDetailsSection';

interface FormProps {
  fairwayCard: FairwayCardInput;
  modified?: number;
  modifier?: string;
  creator?: string;
  created?: number;
  sourceCardId?: string;
  sourceCardVersion?: string;
  isError?: boolean;
}

const FairwayCardForm: React.FC<FormProps> = ({ fairwayCard, modified, modifier, creator, created, sourceCardId, sourceCardVersion, isError }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const history = useHistory();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, setState] = useState<FairwayCardInput>(fairwayCard);
  const [oldState, setOldState] = useState<FairwayCardInput>(fairwayCard);
  const [validationErrors, setValidationErrors] = useState<ValidationType[]>([]);
  const [innerValidationErrors, setInnerValidationErrors] = useState<ValidationType[]>([]);
  const [saveError, setSaveError] = useState<string>();
  const [savedCard, setSavedCard] = useState<FairwayCardByIdFragment | null>();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>(''); // Confirmation modal
  const [previewConfirmation, setPreviewConfirmation] = useState<ConfirmationType>(''); // Preview confirmation modal
  const [previewPending, setPreviewPending] = useState(false);
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false);
  const [publishDetailsOpen, setPublishDetailsOpen] = useState(false);

  const { data: fairwayList, isLoading: isLoadingFairways } = useFairwaysQueryData();
  const { data: harbourList, isLoading: isLoadingHarbours } = useHarboursQueryData();
  const { data: pilotPlaceList, isLoading: isLoadingPilotPlaces } = usePilotPlacesQueryData();
  const { data: mareographList, isLoading: isLoadingMareographs } = useMareographQueryData();

  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData(false);
  // this is for checking the latest version number, so in case creating a new version we get the right url
  const { data: latestFairwayCard } = useFairwayCardLatestByIdQueryData(fairwayCard.id);

  // these are derived straight from featureData unlike others through graphQL
  // the graphQL approach's motives are a bit unclear so possible refactor in the future
  const { data: pilotRouteList, isLoading: isLoadingPilotRoutes } = useFeatureData('pilotroute');

  const { mutate: saveFairwayCard, isPending: isLoadingMutation } = useSaveFairwayCardMutationQuery({
    onSuccess(data) {
      setSavedCard(data.saveFairwayCard);
      setOldState(mapToFairwayCardInput(undefined, { fairwayCard: data.saveFairwayCard }));
      setNotificationOpen(true);
      if (previewPending) {
        handleOpenPreview();
      }
      if (isSubmittingVersion) {
        const latestVersionUsed = latestFairwayCard?.fairwayCard?.latestVersionUsed;
        const latestVersionNumber = latestFairwayCard?.fairwayCard?.latest;
        // if latestVersionUsed is null, check latest. If still null we can assume there's only one version

        const nextVersionNumber = (latestVersionUsed ?? latestVersionNumber ?? 1) + 1;

        history.push({ pathname: '/vaylakortti/' + data.saveFairwayCard?.id + '/v' + nextVersionNumber });
        setIsSubmittingVersion(false);
      }
    },
    onError: (error: Error) => {
      setSaveError(error.message);
      setNotificationOpen(true);
      setPreviewPending(false);
    },
  });

  const fairwaySelection = fairwayList?.fairways.filter((item) => state.fairwayIds.includes(item.id));
  const harbourSelection = harbourList?.harbors.filter((item) => state.harbors?.includes(item.id));
  const harbourOptions = harbourList?.harbors.filter((item) => item.n2000HeightSystem === state.n2000HeightSystem);

  const reservedFairwayCardIds = fairwaysAndHarbours?.fairwayCardsAndHarbors
    .filter((item) => item.type === ContentType.Card)
    .flatMap((item) => item.id);

  const isLoading = isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces || isLoadingMareographs;

  const updateState = (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => {
    setState(
      fairwayCardReducer(
        state,
        value,
        actionType,
        validationErrors,
        setValidationErrors,
        actionLang,
        actionTarget,
        actionOuterTarget,
        reservedFairwayCardIds
      )
    );
  };

  const setValidity = (actionType: ActionType, val: boolean) => {
    setInnerValidationErrors(
      innerValidationErrors
        .filter((error) => error.id !== actionType)
        .concat({ id: actionType, msg: !val ? (t(ErrorMessageKeys?.invalid) ?? '') : '' })
    );
  };

  const saveCard = useCallback(
    (operation: Operation) => {
      const mapTrafficService = (card: FairwayCardInput) => {
        return {
          ...card,
          trafficService: {
            ...card.trafficService,
            pilot: {
              ...card.trafficService?.pilot,
              places: card.trafficService?.pilot?.places?.map((place) => {
                return { id: place.id, pilotJourney: place.pilotJourney };
              }),
            },
          },
        };
      };

      if (operation === Operation.Publish) {
        setState({ ...state, status: Status.Public });
        saveFairwayCard({ card: mapTrafficService({ ...state, status: Status.Public, operation }) as FairwayCardInput });
        setPublishDetailsOpen(false);
      } else if (operation === Operation.Archive) {
        setState({ ...state, status: Status.Archived });
        saveFairwayCard({ card: mapTrafficService({ ...state, status: Status.Archived, operation }) as FairwayCardInput });
      } else if (operation === Operation.Remove) {
        // Ignore unsaved changes if draft card is removed
        setState({ ...oldState, status: Status.Removed });
        saveFairwayCard({ card: mapTrafficService({ ...oldState, status: Status.Removed, operation }) as FairwayCardInput });
      } else if (operation === Operation.Update) {
        if (!!sourceCardId?.length && !!state.pictures?.length) {
          saveFairwayCard({
            card: mapTrafficService(state) as FairwayCardInput,
            pictureSourceId: sourceCardId,
            pictureSourceVersion: sourceCardVersion,
          });
        } else {
          saveFairwayCard({ card: mapTrafficService(state) as FairwayCardInput });
        }
      } else if (operation === Operation.Create) {
        if (!!sourceCardId?.length && !!state.pictures?.length) {
          saveFairwayCard({
            card: mapTrafficService({ ...state, version: 'v1' }) as FairwayCardInput,
            pictureSourceId: sourceCardId,
            pictureSourceVersion: sourceCardVersion,
          });
        } else {
          saveFairwayCard({ card: mapTrafficService({ ...state, version: 'v1' }) as FairwayCardInput });
        }
      } else if (operation === Operation.Createversion) {
        setIsSubmittingVersion(true);
        const newVersion = mapNewFairwayCardVersion(state, !!state.pictures?.length);
        setState(newVersion);
        const newCard = mapTrafficService(newVersion) as FairwayCardInput;
        if (state.pictures?.length) {
          saveFairwayCard({
            card: newCard,
            pictureSourceId: state.id,
            pictureSourceVersion: state.version,
          });
        } else {
          saveFairwayCard({ card: newCard });
        }
      }
    },
    [state, oldState, sourceCardId, sourceCardVersion, saveFairwayCard]
  );

  const formValid = (): boolean => {
    let primaryIdErrorMsg = '';
    const requiredMsg = t(ErrorMessageKeys?.required) ?? '';
    if (state.operation === Operation.Create) {
      if (reservedFairwayCardIds?.includes(state.id.trim())) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId);
      if (state.id.trim().length < 1) primaryIdErrorMsg = requiredMsg;
    }
    const invalidErrorMsg = t(ErrorMessageKeys?.invalid);
    const endDateErrorMsg = t(ErrorMessageKeys.endDateError);
    const validations: ValidationType[] = validateFairwayCardForm(state, requiredMsg, primaryIdErrorMsg, invalidErrorMsg, endDateErrorMsg);
    setValidationErrors(validations);
    return !!formRef.current?.checkValidity() && validations.filter((error) => error.msg.length > 0).length < 1;
  };

  const backToList = () => {
    history.push({ pathname: '/' });
  };

  const handleCancel = () => {
    if (hasUnsavedChanges(oldState, state)) {
      setConfirmationType('cancel');
    } else {
      backToList();
    }
  };

  const handleSave = () => {
    if (formValid()) {
      saveCard(state.operation);
    } else {
      setSaveError('MISSING-INFORMATION');
      setPreviewPending(false);
    }
  };

  const handleRemove = () => {
    if (state.status === Status.Draft) {
      setConfirmationType('remove');
    } else if (state.status === Status.Public) {
      setConfirmationType('archive');
    }
  };

  const handleOpenPreview = () => {
    openPreview(fairwayCard.id, fairwayCard.version, true);
    setPreviewPending(false);
  };

  const handlePreview = () => {
    setPreviewPending(true);
    if (hasUnsavedChanges(oldState, state)) {
      setPreviewConfirmation('preview');
    } else {
      handleOpenPreview();
    }
  };

  const handleNewVersion = () => {
    if (formValid()) {
      setConfirmationType('version');
    } else if (!saveError) {
      setSaveError('OPERATION-BLOCKED');
    }
  };

  const handlePublish = () => {
    if (formValid()) {
      setConfirmationType('publish');
      setPublishDetailsOpen(true);
    } else {
      setSaveError('MISSING-INFORMATION');
    }
  };

  const handleConfirmationSubmit = () => {
    switch (confirmationType) {
      case 'archive':
        return saveCard(Operation.Archive);
      case 'cancel':
        return backToList();
      case 'publish':
        return saveCard(Operation.Publish);
      case 'remove':
        return saveCard(Operation.Remove);
      case 'version':
        return saveCard(Operation.Createversion);
      default:
        return;
    }
  };

  const getDateTimeInfo = (isModifiedInfo: boolean) => {
    if (savedCard) {
      return t('general.datetimeFormat', {
        val: isModifiedInfo
          ? (savedCard.modificationTimestamp ?? savedCard.creationTimestamp)
          : (savedCard.creationTimestamp ?? savedCard.modificationTimestamp),
      });
    }
    if (isModifiedInfo) {
      return modified ? t('general.datetimeFormat', { val: modified }) : '-';
    } else {
      return created ? t('general.datetimeFormat', { val: created }) : '-';
    }
  };

  const closeNotification = () => {
    setSaveError('');
    setNotificationOpen(false);
    if (!saveError && !!savedCard && state.operation === Operation.Create) {
      history.push({ pathname: '/vaylakortti/' + savedCard.id + '/' + savedCard.version });
    }
  };

  useEffect(() => {
    setState(fairwayCard);
    setOldState(structuredClone(fairwayCard));
  }, [fairwayCard]);

  const infoHeader: InfoHeaderProps = {
    status: state.status,
    modified: getDateTimeInfo(true),
    created: getDateTimeInfo(false),
    version: fairwayCard.version,
    modifier: savedCard?.modifier ?? savedCard?.creator ?? modifier ?? t('general.unknown'),
    creator: savedCard?.creator ?? creator,
  };

  return (
    <IonPage>
      <PublishModal
        state={state}
        setModalOpen={setPublishDetailsOpen}
        setValue={updateState}
        handleConfirmationSubmit={handleConfirmationSubmit}
        modalOpen={publishDetailsOpen}
        infoHeader={infoHeader}
      />
      <ConfirmationModal
        saveType="fairwaycard"
        action={handleConfirmationSubmit}
        confirmationType={confirmationType}
        setConfirmationType={setConfirmationType}
        newStatus={state.status}
        oldState={savedCard ? (savedCard as StatusName) : fairwayCard}
        setActionPending={setPreviewPending}
      />
      <ConfirmationModal
        saveType="fairwaycard"
        action={() => saveCard(state.operation)}
        confirmationType={previewConfirmation}
        setConfirmationType={setPreviewConfirmation}
        newStatus={state.status}
        oldState={savedCard ? (savedCard as StatusName) : fairwayCard}
        setActionPending={setPreviewPending}
      />
      <NotificationModal
        isOpen={!!saveError || notificationOpen}
        closeAction={closeNotification}
        closeTitle={t('general.button-ok')}
        header={(saveError ? t('general.save-failed') : t('general.save-successful')) || ''}
        subHeader={
          (saveError
            ? t('general.error-' + saveError)
            : t('modal.saved-fairwaycard-by-name', { name: savedCard?.name[lang] ?? savedCard?.name.fi })) ?? ''
        }
        message={saveError ? t('general.fix-errors-try-again') || '' : ''}
      />
      <Header
        currentState={state}
        oldState={oldState}
        isLoading={isLoading}
        isLoadingMutation={isLoadingMutation}
        handleCancel={handleCancel}
        handleSave={handleSave}
        handleRemove={handleRemove}
        handlePreview={handlePreview}
        handleNewVersion={handleNewVersion}
        handlePublish={handlePublish}
        isError={isError}
      />

      <IonContent className="mainContent ion-no-padding" data-testid="fairwayCardEditPage">
        {isError && <p>{t('general.loading-error')}</p>}

        {!isError && (
          <>
            <InfoHeader
              status={state.status}
              modified={getDateTimeInfo(true)}
              modifier={savedCard?.modifier ?? savedCard?.creator ?? modifier ?? t('general.unknown')}
              creator={savedCard?.creator ?? creator}
              created={getDateTimeInfo(false)}
            />
            <form ref={formRef}>
              <PublishDetailsSection state={state} />
              <MainSection
                state={state}
                updateState={updateState}
                validationErrors={validationErrors}
                setValidity={setValidity}
                isLoadingFairways={isLoadingFairways}
                isLoadingHarbours={isLoadingHarbours}
                fairwayOptions={fairwayList?.fairways}
                fairwaySelection={fairwaySelection}
                harbourOptions={harbourOptions}
                isLoadingPilotRoutes={isLoadingPilotRoutes}
                pilotRouteOptions={pilotRouteList}
                sourceCard={sourceCardId}
              />
              <NotificationSection
                state={state}
                sections={state.temporaryNotifications as TemporaryNotificationInput[]}
                updateState={updateState}
                sectionType="temporaryNotifications"
                validationErrors={validationErrors}
              />
              <FairwaySection state={state} updateState={updateState} validationErrors={validationErrors} />
              <NavigationSection state={state} updateState={updateState} validationErrors={validationErrors} />
              <RecommendationsSection
                state={state}
                updateState={updateState}
                validationErrors={validationErrors}
                isLoadingMareographs={isLoadingMareographs}
                mareographOptions={mareographList?.mareographs}
              />
              <AdditionalInfoSection state={state} updateState={updateState} validationErrors={validationErrors} />
              <TrafficServiceSection
                state={state}
                updateState={updateState}
                validationErrors={validationErrors}
                isLoadingPilotPlaces={isLoadingPilotPlaces}
                pilotPlaceOptions={pilotPlaceList?.pilotPlaces}
              />

              <Section
                title={t('fairwaycard.vts-heading')}
                sections={state.trafficService?.vts as VtsInput[]}
                updateState={updateState}
                sectionType="vts"
                validationErrors={validationErrors}
                disabled={state.status === Status.Removed}
              />

              <Section
                title={t('fairwaycard.tug-heading')}
                sections={state.trafficService?.tugs as TugInput[]}
                updateState={updateState}
                sectionType="tug"
                validationErrors={validationErrors}
                disabled={state.status === Status.Removed}
              />

              <IonText>
                <h2>
                  {t('fairwaycard.print-images')}
                  {!!sourceCardId?.length && !!state.pictures?.length && (
                    <span className="print-images-warning">{t('fairwaycard.print-images-warning')}</span>
                  )}
                </h2>
              </IonText>

              <MapExportTool
                fairwayCardInput={state}
                disabled={state.status === Status.Removed}
                validationErrors={validationErrors.concat(innerValidationErrors)}
                setPicture={updateState}
                fairways={fairwaySelection}
                harbours={harbourSelection}
                sourceCardId={sourceCardId}
                sourceCardVersion={sourceCardVersion}
              />
            </form>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

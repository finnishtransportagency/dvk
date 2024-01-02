import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ConfirmationType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
import { ContentType, FairwayCardByIdFragment, FairwayCardInput, Operation, Status, TugInput, VtsInput } from '../graphql/generated';
import {
  useFairwayCardsAndHarborsQueryData,
  useFairwaysQueryData,
  useHarboursQueryData,
  usePilotPlacesQueryData,
  useSaveFairwayCardMutationQuery,
} from '../graphql/api';
import Section from './form/Section';
import { fairwayCardReducer } from '../utils/fairwayCardReducer';
import ConfirmationModal, { StatusName } from './ConfirmationModal';
import { useHistory } from 'react-router';
import NotificationModal from './NofiticationModal';
import MapExportTool from './MapExportTool';
import { mapToFairwayCardInput } from '../utils/dataMapper';
import { hasUnsavedChanges, validateFairwayCardForm } from '../utils/formValidations';
import MainSection from './form/fairwayCard/MainSection';
import FairwaySection from './form/fairwayCard/FairwaySection';
import NavigationSection from './form/fairwayCard/NavigationSection';
import RecommendationsSection from './form/fairwayCard/RecommendationsSection';
import TrafficServiceSection from './form/fairwayCard/TrafficServiceSection';
import Header from './form/Header';
import { openPreview } from '../utils/common';

interface FormProps {
  fairwayCard: FairwayCardInput;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

const FairwayCardForm: React.FC<FormProps> = ({ fairwayCard, modified, modifier, isError }) => {
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

  const { data: fairwayList, isLoading: isLoadingFairways } = useFairwaysQueryData();
  const { data: harbourList, isLoading: isLoadingHarbours } = useHarboursQueryData();
  const { data: pilotPlaceList, isLoading: isLoadingPilotPlaces } = usePilotPlacesQueryData();
  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();
  const { mutate: saveFairwayCard, isPending: isLoadingMutation } = useSaveFairwayCardMutationQuery({
    onSuccess(data) {
      setSavedCard(data.saveFairwayCard);
      setOldState(mapToFairwayCardInput(false, { fairwayCard: data.saveFairwayCard }));
      setNotificationOpen(true);
    },
    onError: (error: Error) => {
      setSaveError(error.message);
      setNotificationOpen(true);
    },
  });

  const fairwaySelection = fairwayList?.fairways.filter((item) => state.fairwayIds.includes(item.id));
  const harbourSelection = harbourList?.harbors.filter((item) => state.harbors?.includes(item.id));
  const harbourOptions = harbourList?.harbors.filter((item) => item.n2000HeightSystem === state.n2000HeightSystem && item.status === Status.Public);

  const reservedFairwayCardIds = fairwaysAndHarbours?.fairwayCardsAndHarbors
    .filter((item) => item.type === ContentType.Card)
    .flatMap((item) => item.id);

  const isLoading = isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces;

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
      innerValidationErrors.filter((error) => error.id !== actionType).concat({ id: actionType, msg: !val ? t(ErrorMessageKeys?.invalid) ?? '' : '' })
    );
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

  const saveCard = useCallback(
    (isRemove?: boolean, isPreview?: boolean) => {
      if (isRemove) {
        const oldCard = {
          ...oldState,
          trafficService: {
            ...oldState.trafficService,
            pilot: {
              ...oldState.trafficService?.pilot,
              places: oldState.trafficService?.pilot?.places?.map((place) => {
                return { id: place.id, pilotJourney: place.pilotJourney };
              }),
            },
          },
          status: Status.Removed,
        };
        setState({ ...oldState, status: Status.Removed });
        saveFairwayCard({ card: oldCard as FairwayCardInput });
      } else {
        const currentCard = {
          ...state,
          trafficService: {
            ...state.trafficService,
            pilot: {
              ...state.trafficService?.pilot,
              places: state.trafficService?.pilot?.places?.map((place) => {
                return { id: place.id, pilotJourney: place.pilotJourney };
              }),
            },
          },
        };
        saveFairwayCard({ card: currentCard as FairwayCardInput });

        if (isPreview) {
          openPreview(fairwayCard.id, true);
        }
      }
    },
    [state, oldState, saveFairwayCard, fairwayCard.id]
  );

  const formValid = (): boolean => {
    let primaryIdErrorMsg = '';
    const requiredMsg = t(ErrorMessageKeys?.required) ?? '';
    if (state.operation === Operation.Create) {
      if (reservedFairwayCardIds?.includes(state.id.trim())) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId);
      if (state.id.trim().length < 1) primaryIdErrorMsg = requiredMsg;
    }
    const validations: ValidationType[] = validateFairwayCardForm(state, requiredMsg, primaryIdErrorMsg);
    setValidationErrors(validations);
    return !!formRef.current?.checkValidity() && validations.filter((error) => error.msg.length > 0).length < 1;
  };

  const handleSubmit = (isRemove = false, isPreview = false) => {
    if (isRemove) {
      setConfirmationType('remove');
    } else if (formValid()) {
      if (state.status === Status.Draft && (oldState.status === Status.Draft || state.operation === Operation.Create)) {
        saveCard(false, isPreview);
      } else {
        setConfirmationType(isPreview ? 'previewsave' : 'save');
      }
    } else {
      setSaveError('MISSING-INFORMATION');
    }
  };

  const handlePreviewSubmit = () => {
    handleSubmit(false, true);
  };

  const handlePreviewSave = () => {
    saveCard(false, true);
  };

  const handlePreview = () => {
    if (hasUnsavedChanges(oldState, state)) {
      setConfirmationType('preview');
    } else {
      openPreview(fairwayCard.id, true);
    }
  };

  const getModifiedInfo = () => {
    if (savedCard) return t('general.datetimeFormat', { val: savedCard.modificationTimestamp ?? savedCard.creationTimestamp });
    return modified ? t('general.datetimeFormat', { val: modified }) : '-';
  };

  const closeNotification = () => {
    setSaveError('');
    setNotificationOpen(false);
    if (!saveError && !!savedCard && state.operation === Operation.Create) {
      history.push({ pathname: '/vaylakortti/' + savedCard.id });
    }
  };

  const getConfirmationAction = () => {
    switch (confirmationType) {
      case 'cancel':
        return backToList;
      case 'preview':
        return handlePreviewSubmit;
      case 'previewsave':
        return handlePreviewSave;
      default:
        return saveCard;
    }
  };

  useEffect(() => {
    setState(fairwayCard);
    setOldState(fairwayCard);
  }, [fairwayCard]);

  return (
    <IonPage>
      <ConfirmationModal
        saveType="fairwaycard"
        action={getConfirmationAction()}
        confirmationType={confirmationType}
        setConfirmationType={setConfirmationType}
        newStatus={state.status}
        oldState={savedCard ? (savedCard as StatusName) : fairwayCard}
      />
      <NotificationModal
        isOpen={!!saveError || notificationOpen}
        closeAction={closeNotification}
        header={(saveError ? t('general.save-failed') : t('general.save-successful')) || ''}
        subHeader={
          (saveError
            ? t('general.error-' + saveError)
            : t('modal.saved-fairwaycard-by-name', { name: savedCard?.name[lang] ?? savedCard?.name.fi })) ?? ''
        }
        message={saveError ? t('general.fix-errors-try-again') || '' : ''}
      />
      <Header
        operation={state.operation}
        status={state.status}
        oldStatus={oldState.status}
        isLoading={isLoading}
        isLoadingMutation={isLoadingMutation}
        updateState={updateState}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handlePreview={handlePreview}
        modifiedInfo={getModifiedInfo()}
        modifierInfo={savedCard?.modifier ?? savedCard?.creator ?? modifier ?? t('general.unknown')}
        isError={isError}
      />

      <IonContent className="mainContent ion-no-padding" data-testid="fairwayCardEditPage">
        {isError && <p>{t('general.loading-error')}</p>}

        {!isError && (
          <form ref={formRef}>
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
            />
            <FairwaySection state={state} updateState={updateState} validationErrors={validationErrors} />
            <NavigationSection state={state} updateState={updateState} validationErrors={validationErrors} />
            <RecommendationsSection state={state} updateState={updateState} validationErrors={validationErrors} />
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
              <h2>{t('fairwaycard.print-images')}</h2>
            </IonText>
            <MapExportTool
              fairwayCardInput={state}
              disabled={state.status === Status.Removed}
              validationErrors={validationErrors.concat(innerValidationErrors)}
              setPicture={updateState}
              fairways={fairwaySelection}
              harbours={harbourSelection}
            />
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

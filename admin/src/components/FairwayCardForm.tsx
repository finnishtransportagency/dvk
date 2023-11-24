import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonText } from '@ionic/react';
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
import SelectInput from './form/SelectInput';
import Section from './form/Section';
import { fairwayCardReducer } from '../utils/fairwayCardReducer';
import ConfirmationModal, { StatusName } from './ConfirmationModal';
import { useHistory } from 'react-router';
import { diff } from 'deep-object-diff';
import NotificationModal from './NofiticationModal';
import MapExportTool from './MapExportTool';
import { mapToFairwayCardInput } from '../utils/dataMapper';
import { validateFairwayCardForm } from '../utils/formValidations';
import MainSection from './form/fairwayCard/MainSection';
import FairwaySection from './form/fairwayCard/FairwaySection';
import NavigationSection from './form/fairwayCard/NavigationSection';
import RecommendationsSection from './form/fairwayCard/RecommendationsSection';
import TrafficServiceSection from './form/fairwayCard/TrafficServiceSection';

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

  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (state.operation === Operation.Update) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

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
    const diffObj = diff(oldState, state);
    if (JSON.stringify(diffObj) === '{}') {
      backToList();
    } else {
      setConfirmationType('cancel');
    }
  };

  const saveCard = useCallback(
    (isRemove?: boolean) => {
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
      }
    },
    [state, oldState, saveFairwayCard]
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

  const handleSubmit = (isRemove = false) => {
    if (isRemove) {
      setConfirmationType('remove');
    } else if (formValid()) {
      if (
        (state.operation === Operation.Create && state.status === Status.Draft) ||
        (state.status === Status.Draft && oldState.status === Status.Draft)
      ) {
        saveCard(false);
      } else {
        setConfirmationType('save');
      }
    } else {
      setSaveError('MISSING-INFORMATION');
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

  useEffect(() => {
    setState(fairwayCard);
    setOldState(fairwayCard);
    console.log(fairwayCard);
  }, [fairwayCard]);

  return (
    <IonPage>
      <ConfirmationModal
        saveType="fairwaycard"
        action={confirmationType === 'cancel' ? backToList : saveCard}
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
      <IonHeader className="ion-no-border" id="mainPageContent">
        {isLoadingMutation && <IonProgressBar type="indeterminate" />}
        <IonGrid className="optionBar">
          <IonRow className="ion-align-items-end">
            <IonCol className="align-right">
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol>
                    <IonText>
                      <em>
                        {state.operation === Operation.Update ? t('general.item-modified') : t('general.item-created')}: {getModifiedInfo()}
                        <br />
                        {state.operation === Operation.Update ? t('general.item-modifier') : t('general.item-creator')}:{' '}
                        {savedCard?.modifier ?? savedCard?.creator ?? modifier ?? t('general.unknown')}
                      </em>
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
            <IonCol size="auto">
              <SelectInput
                label={t('general.item-status')}
                selected={state.status}
                options={statusOptions}
                setSelected={updateState}
                actionType="status"
                disabled={isLoading}
              />
            </IonCol>
            <IonCol size="auto">
              <IonButton shape="round" className="invert" onClick={() => handleCancel()} disabled={isLoading}>
                {t('general.cancel')}
              </IonButton>
              {state.operation === Operation.Update && oldState.status !== Status.Removed && (
                <IonButton
                  shape="round"
                  color="danger"
                  disabled={isError ?? isLoading}
                  onClick={() => {
                    handleSubmit(true);
                  }}
                >
                  {t('general.delete')}
                </IonButton>
              )}
              <IonButton shape="round" disabled={isError ?? isLoading} onClick={() => handleSubmit(state.status === Status.Removed)}>
                {state.operation === Operation.Update ? t('general.save') : t('general.create-new')}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonHeader>

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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ConfirmationType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
import {
  ContentType,
  FairwayCardByIdFragment,
  FairwayCardInput,
  Operation,
  PilotPlace,
  PilotPlaceInput,
  Status,
  TugInput,
  VtsInput,
} from '../graphql/generated';
import {
  useFairwayCardsAndHarborsQueryData,
  useFairwaysQueryData,
  useHarboursQueryData,
  usePilotPlacesQueryData,
  useSaveFairwayCardMutationQuery,
} from '../graphql/api';
import TextInput from './form/TextInput';
import SelectInput from './form/SelectInput';
import SelectWithFilter from './form/SelectWithFilter';
import TextInputRow from './form/TextInputRow';
import Section from './form/Section';
import { fairwayCardReducer } from '../utils/fairwayCardReducer';
import ConfirmationModal, { StatusName } from './ConfirmationModal';
import { useHistory } from 'react-router';
import { diff } from 'deep-object-diff';
import NotificationModal from './NofiticationModal';
import MapExportTool from './MapExportTool';
import { mapToFairwayCardInput } from '../utils/dataMapper';
import { validateFairwayCardForm } from '../utils/formValidations';

interface FormProps {
  fairwayCard: FairwayCardInput;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

const FairwayCardForm: React.FC<FormProps> = ({ fairwayCard, modified, modifier, isError }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  const { data: fairwayList, isLoading: isLoadingFairways } = useFairwaysQueryData();
  const { data: harbourList, isLoading: isLoadingHarbours } = useHarboursQueryData();
  const { data: pilotPlaceList, isLoading: isLoadingPilotPlaces } = usePilotPlacesQueryData();
  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();

  const [oldState, setOldState] = useState<FairwayCardInput>(fairwayCard);
  const [state, setState] = useState<FairwayCardInput>(fairwayCard);
  const fairwaySelection = fairwayList?.fairways.filter((item) => state.fairwayIds.includes(item.id));
  const harbourSelection = harbourList?.harbors.filter((item) => item.n2000HeightSystem === state.n2000HeightSystem && item.status === Status.Public);
  const harbourSelectionFiltered = harbourList?.harbors.filter((item) => state.harbors?.includes(item.id));
  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (state.operation === Operation.Update) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

  const [validationErrors, setValidationErrors] = useState<ValidationType[]>([]);
  const reservedFairwayCardIds = fairwaysAndHarbours?.fairwayCardsAndHarbors
    .filter((item) => item.type === ContentType.Card)
    .flatMap((item) => item.id);

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

  const [innerValidationErrors, setInnerValidationErrors] = useState<ValidationType[]>([]);
  const setValidity = (actionType: ActionType, val: boolean) => {
    setInnerValidationErrors(
      innerValidationErrors.filter((error) => error.id !== actionType).concat({ id: actionType, msg: !val ? t(ErrorMessageKeys?.invalid) || '' : '' })
    );
  };

  useEffect(() => {
    setState(fairwayCard);
    setOldState(fairwayCard);
  }, [fairwayCard]);

  // Confirmation modal
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('');

  const history = useHistory();
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

  // Save fairway card
  const [saveError, setSaveError] = useState<string>();
  const [savedCard, setSavedCard] = useState<FairwayCardByIdFragment | null>();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: saveFairwayCard, isPending: isLoadingMutation } = useSaveFairwayCardMutationQuery({
    onSuccess(data) {
      setSavedCard(data.saveFairwayCard);
      setOldState(mapToFairwayCardInput(false, { fairwayCard: data.saveFairwayCard }));
      setIsOpen(true);
    },
    onError: (error: Error) => {
      setSaveError(error.message);
      setIsOpen(true);
    },
  });

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

  const formRef = useRef<HTMLFormElement>(null);

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
    setIsOpen(false);
    if (!saveError && !!savedCard) {
      if (state.operation === Operation.Create) history.push({ pathname: '/vaylakortti/' + savedCard.id });
    }
  };
  const confirmationCondition =
    (savedCard ? (savedCard as StatusName) : fairwayCard).status === Status.Draft && state.status === Status.Draft && confirmationType === '';

  return (
    <IonPage>
      {!confirmationCondition && (
        <ConfirmationModal
          saveType="fairwaycard"
          action={confirmationType === 'cancel' ? backToList : saveCard}
          confirmationType={confirmationType}
          setConfirmationType={setConfirmationType}
          newStatus={state.status}
          oldState={savedCard ? (savedCard as StatusName) : fairwayCard}
        />
      )}
      <NotificationModal
        isOpen={!!saveError || isOpen}
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
                disabled={isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces}
              />
            </IonCol>
            <IonCol size="auto">
              <IonButton
                shape="round"
                className="invert"
                onClick={() => handleCancel()}
                disabled={isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces}
              >
                {t('general.cancel')}
              </IonButton>
              {state.operation === Operation.Update && oldState.status !== Status.Removed && (
                <IonButton
                  shape="round"
                  color="danger"
                  disabled={isError ?? (isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces)}
                  onClick={() => {
                    handleSubmit(true);
                  }}
                >
                  {t('general.delete')}
                </IonButton>
              )}
              <IonButton
                shape="round"
                disabled={isError ?? (isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces)}
                onClick={() => handleSubmit(state.status === Status.Removed)}
              >
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
            <IonGrid className="formGrid">
              <TextInputRow
                labelKey="fairwaycard.name"
                value={state.name}
                updateState={updateState}
                actionType="name"
                name="fairwayCardName"
                required
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'name')?.msg}
              />
              <IonRow>
                <IonCol sizeMd="3">
                  <TextInput
                    label={t('fairwaycard.primary-id')}
                    val={state.id}
                    setValue={updateState}
                    actionType="primaryId"
                    name="primaryId"
                    required
                    disabled={state.operation === Operation.Update || !!state.pictures?.length}
                    error={state.operation === Operation.Update ? '' : validationErrors.find((error) => error.id === 'primaryId')?.msg}
                    helperText={t('fairwaycard.primary-id-help-text')}
                    setValidity={setValidity}
                  />
                </IonCol>
                <IonCol sizeMd="3">
                  <SelectWithFilter
                    label={t('fairwaycard.linked-fairways')}
                    options={fairwayList?.fairways ?? []}
                    selected={state.fairwayIds || []}
                    setSelected={updateState}
                    actionType="fairwayIds"
                    required
                    showId
                    disabled={state.status === Status.Removed}
                    error={validationErrors.find((error) => error.id === 'fairwayIds')?.msg}
                    isLoading={isLoadingFairways}
                  />
                </IonCol>
                <IonCol sizeMd="3">
                  <SelectInput
                    label={t('fairwaycard.starting-fairway')}
                    selected={state.primaryFairwayId ?? ''}
                    options={fairwaySelection ?? []}
                    setSelected={updateState}
                    actionType="fairwayPrimary"
                    required
                    showId
                    disabled={state.fairwayIds.length < 2 || state.status === Status.Removed}
                    helperText={t('fairwaycard.fairway-order-help-text')}
                    isLoading={isLoadingFairways}
                  />
                </IonCol>
                <IonCol sizeMd="3">
                  <SelectInput
                    label={t('fairwaycard.ending-fairway')}
                    selected={state.secondaryFairwayId ?? ''}
                    options={fairwaySelection ?? []}
                    setSelected={updateState}
                    actionType="fairwaySecondary"
                    required
                    showId
                    disabled={state.fairwayIds.length < 2 || state.status === Status.Removed}
                    helperText={t('fairwaycard.fairway-order-help-text')}
                    isLoading={isLoadingFairways}
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol sizeMd="3">
                  <SelectInput
                    label={t('general.item-area')}
                    selected={state.group}
                    options={[
                      { name: { fi: t('general.archipelagoSea') }, id: '1' },
                      { name: { fi: t('general.gulfOfFinland') }, id: '2' },
                      { name: { fi: t('general.gulfOfBothnia') }, id: '3' },
                    ]}
                    setSelected={updateState}
                    actionType="group"
                    required
                    disabled={state.status === Status.Removed}
                    error={validationErrors.find((error) => error.id === 'group')?.msg}
                  />
                </IonCol>
                <IonCol sizeMd="3">
                  <SelectInput
                    label={t('general.item-referencelevel')}
                    selected={state.n2000HeightSystem}
                    options={[
                      { name: { fi: 'MW' }, id: false },
                      { name: { fi: 'N2000' }, id: true },
                    ]}
                    setSelected={updateState}
                    actionType="referenceLevel"
                    disabled={state.status === Status.Removed}
                  />
                </IonCol>
                <IonCol sizeMd="3">
                  <SelectInput
                    label={t('fairwaycard.linked-harbours')}
                    selected={state.harbors ?? []}
                    options={harbourSelection ?? []}
                    setSelected={updateState}
                    actionType="harbours"
                    multiple
                    isLoading={isLoadingHarbours}
                    disabled={state.status === Status.Removed}
                  />
                </IonCol>
                <IonCol sizeMd="3"></IonCol>
              </IonRow>
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.fairway-info')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <TextInputRow
                labelKey="fairwaycard.lining-and-marking"
                value={state.lineText}
                updateState={updateState}
                actionType="line"
                required={!!state.lineText?.fi || !!state.lineText?.sv || !!state.lineText?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'line')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.design-speed"
                value={state.designSpeed}
                updateState={updateState}
                actionType="designSpeed"
                required={!!state.designSpeed?.fi || !!state.designSpeed?.sv || !!state.designSpeed?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'designSpeed')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.speed-limit"
                value={state.speedLimit}
                updateState={updateState}
                actionType="speedLimit"
                required={!!state.speedLimit?.fi || !!state.speedLimit?.sv || !!state.speedLimit?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'speedLimit')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.anchorage"
                value={state.anchorage}
                updateState={updateState}
                actionType="anchorage"
                required={!!state.anchorage?.fi || !!state.anchorage?.sv || !!state.anchorage?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'anchorage')?.msg}
                inputType="textarea"
              />
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.navigation')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <TextInputRow
                labelKey="fairwaycard.navigation-condition"
                value={state.navigationCondition}
                updateState={updateState}
                actionType="navigationCondition"
                required={!!state.navigationCondition?.fi || !!state.navigationCondition?.sv || !!state.navigationCondition?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'navigationCondition')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.ice-condition"
                value={state.iceCondition}
                updateState={updateState}
                actionType="iceCondition"
                required={!!state.iceCondition?.fi || !!state.iceCondition?.sv || !!state.iceCondition?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'iceCondition')?.msg}
                inputType="textarea"
              />
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.recommendation')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <TextInputRow
                labelKey="fairwaycard.wind-recommendation"
                value={state.windRecommendation}
                updateState={updateState}
                actionType="windRecommendation"
                required={!!state.windRecommendation?.fi || !!state.windRecommendation?.sv || !!state.windRecommendation?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'windRecommendation')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.vessel-recommendation"
                value={state.vesselRecommendation}
                updateState={updateState}
                actionType="vesselRecommendation"
                required={!!state.vesselRecommendation?.fi || !!state.vesselRecommendation?.sv || !!state.vesselRecommendation?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'vesselRecommendation')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.visibility-recommendation"
                value={state.visibility}
                updateState={updateState}
                actionType="visibility"
                required={!!state.visibility?.fi || !!state.visibility?.sv || !!state.visibility?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'visibility')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.wind-gauge"
                value={state.windGauge}
                updateState={updateState}
                actionType="windGauge"
                required={!!state.windGauge?.fi || !!state.windGauge?.sv || !!state.windGauge?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'windGauge')?.msg}
                inputType="textarea"
              />
              <TextInputRow
                labelKey="fairwaycard.sea-level"
                value={state.seaLevel}
                updateState={updateState}
                actionType="seaLevel"
                required={!!state.seaLevel?.fi || !!state.seaLevel?.sv || !!state.seaLevel?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'seaLevel')?.msg}
                inputType="textarea"
              />
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.traffic-services')}</h2>
              <h3>{t('fairwaycard.pilot-order')}</h3>
            </IonText>
            <IonGrid className="formGrid">
              <IonRow>
                <IonCol sizeMd="4">
                  <TextInput
                    label={t('general.email')}
                    val={state.trafficService?.pilot?.email ?? ''}
                    setValue={updateState}
                    actionType="pilotEmail"
                    disabled={state.status === Status.Removed}
                    inputType="email"
                  />
                </IonCol>
                <IonCol sizeMd="4">
                  <TextInput
                    label={t('general.phone-number')}
                    val={state.trafficService?.pilot?.phoneNumber ?? ''}
                    setValue={updateState}
                    actionType="pilotPhone"
                    disabled={state.status === Status.Removed}
                    inputType="tel"
                  />
                </IonCol>
                <IonCol sizeMd="4">
                  <TextInput
                    label={t('general.fax')}
                    val={state.trafficService?.pilot?.fax ?? ''}
                    setValue={updateState}
                    actionType="pilotFax"
                    disabled={state.status === Status.Removed}
                    inputType="tel"
                  />
                </IonCol>
              </IonRow>
              <TextInputRow
                labelKey="general.additional-information"
                value={state.trafficService?.pilot?.extraInfo}
                updateState={updateState}
                actionType="pilotExtraInfo"
                required={
                  !!state.trafficService?.pilot?.extraInfo?.fi ||
                  !!state.trafficService?.pilot?.extraInfo?.sv ||
                  !!state.trafficService?.pilot?.extraInfo?.en
                }
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'pilotExtraInfo')?.msg}
                inputType="textarea"
              />
              <IonRow>
                <IonCol sizeMd="6">
                  <SelectInput
                    label={t('fairwaycard.linked-pilot-places')}
                    selected={(state.trafficService?.pilot?.places as PilotPlaceInput[]) || []}
                    options={pilotPlaceList?.pilotPlaces ?? []}
                    setSelected={updateState}
                    actionType="pilotPlaces"
                    multiple
                    compareObjects
                    isLoading={isLoadingPilotPlaces}
                    disabled={state.status === Status.Removed}
                    showCoords
                  />
                </IonCol>
                {state.trafficService?.pilot?.places?.map((place) => {
                  const pilotPlace = place as PilotPlace;
                  const pilotName = (pilotPlace.name && (pilotPlace.name[lang] || pilotPlace.name.fi)) || pilotPlace.id.toString();
                  return (
                    <IonCol key={place.id}>
                      <TextInput
                        label={t('fairwaycard.pilotage-distance-from') + ' ' + pilotName}
                        val={place.pilotJourney}
                        setValue={updateState}
                        actionType="pilotJourney"
                        actionTarget={place.id}
                        unit="nm"
                        inputType="number"
                        max={999.9}
                        decimalCount={1}
                        disabled={state.status === Status.Removed}
                      />
                    </IonCol>
                  );
                })}
              </IonRow>
            </IonGrid>

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
              harbours={harbourSelectionFiltered}
            />
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

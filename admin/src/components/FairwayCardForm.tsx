import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonAlert, IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ErrorMessageType, Lang, ValidationType, ValueType } from '../utils/constants';
import { ContentType, FairwayCard, FairwayCardInput, Operation, PilotPlace, PilotPlaceInput, Status, TugInput, VtsInput } from '../graphql/generated';
import {
  useFairwayCardsAndHarborsQueryData,
  useFairwaysQueryData,
  useHarboursQueryData,
  usePilotPlacesQueryData,
  useSaveFairwayCardMutationQuery,
} from '../graphql/api';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextInputRow from './FormTextInputRow';
import FormOptionalSection from './FormOptionalSection';
import { fairwayCardReducer } from '../utils/fairwayCardReducer';
import ConfirmationModal, { StatusName } from './ConfirmationModal';

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

  const [state, setState] = useState<FairwayCardInput>(fairwayCard);
  const fairwaySelection = fairwayList?.fairways.filter((item) => state.fairwayIds.includes(item.id));
  const harborSelection = harbourList?.harbors.filter((item) => item.n2000HeightSystem === state.n2000HeightSystem);
  const modifiedInfo = modified ? t('general.datetimeFormat', { val: modified }) : '-';
  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (fairwayCard.status !== Status.Draft) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

  const [validationErrors, setValidationErrors] = useState<ValidationType[]>([]);
  const reservedFairwayCardIds = fairwaysAndHarbours?.fairwayCardsAndHarbors
    .filter((item) => item.type === ContentType.Card)
    .flatMap((item) => item.id);
  const errorMessages = { required: t('general.required-field'), duplicateId: t('fairwaycard.error-duplicate-id') } as ErrorMessageType;

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
        errorMessages,
        reservedFairwayCardIds
      )
    );
  };

  useEffect(() => {
    setState(fairwayCard);
  }, [fairwayCard]);

  // Save fairway card
  const [saveError, setSaveError] = useState<string>();
  const [savedCard, setSavedCard] = useState<FairwayCard | null>();
  const { mutate: saveFairwayCard, isLoading: isLoadingMutation } = useSaveFairwayCardMutationQuery({
    onSuccess(data) {
      setSavedCard(data.saveFairwayCard);
    },
    onError: (error: Error) => {
      setSaveError(error.message);
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const saveCard = useCallback(() => {
    const currentCard = {
      ...state,
      trafficService: {
        ...state.trafficService,
        pilot: {
          ...state.trafficService?.pilot,
          places: state.trafficService?.pilot?.places?.map((place) => {
            return { id: place.id, pilotJourney: Number(place.pilotJourney) || undefined };
          }),
        },
      },
    };
    console.log(currentCard);
    saveFairwayCard({ card: currentCard as FairwayCardInput });
  }, [state, saveFairwayCard]);

  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (isRemove = false) => {
    // Manual validations for required fields
    const manualValidations = [
      { id: 'name', msg: !state.name.fi.trim() || !state.name.sv.trim() || !state.name.en.trim() ? t('general.required-field') : '' },
      { id: 'primaryId', msg: !state.id.trim() ? t('general.required-field') : '' },
      { id: 'fairwayIds', msg: state.fairwayIds.length < 1 ? t('general.required-field') : '' },
      { id: 'group', msg: state.group.length < 1 ? t('general.required-field') : '' },
      {
        id: 'vtsName',
        msg:
          (state.trafficService?.vts?.filter((vtsItem) => !vtsItem?.name.fi.trim() || !vtsItem?.name.sv.trim() || !vtsItem?.name.en.trim()) || [])
            .length > 0
            ? t('general.required-field')
            : '',
      },
      {
        id: 'tugName',
        msg:
          (state.trafficService?.tugs?.filter((tugItem) => !tugItem?.name.fi.trim() || !tugItem?.name.sv.trim() || !tugItem?.name.en.trim()) || [])
            .length > 0
            ? t('general.required-field')
            : '',
      },
    ];
    setValidationErrors(manualValidations);

    if (formRef.current?.checkValidity() && manualValidations.filter((error) => error.msg.length > 0).length < 1) {
      if (state.operation === Operation.Create || (state.status === Status.Draft && fairwayCard.status === Status.Draft && !isRemove)) {
        saveCard();
      } else {
        setIsOpen(true);
      }
    } else {
      setSaveError('MISSING-INFORMATION');
    }
  };

  return (
    <IonPage>
      <ConfirmationModal
        saveType="fairwaycard"
        action={saveCard}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        newStatus={state.status}
        oldState={savedCard ? (savedCard as StatusName) : fairwayCard}
      />
      <IonAlert
        isOpen={!!saveError || !!savedCard}
        onDidDismiss={() => {
          setSaveError('');
          setSavedCard(null);
        }}
        header={(saveError ? t('general.save-failed') : t('general.save-successful')) || ''}
        subHeader={(saveError ? t('general.error-' + saveError) : t('general.saved-by-id', { id: savedCard?.id })) || ''}
        message={saveError ? t('general.fix-errors-try-again') || '' : ''}
        buttons={[t('general.button-ok') || '']}
        cssClass={saveError ? 'error' : 'success'}
      />
      <IonHeader className="ion-no-border">
        {isLoadingMutation && <IonProgressBar type="indeterminate" />}
        <IonGrid className="optionBar">
          <IonRow>
            <IonCol className="ion-align-self-center align-right">
              <IonText>
                <em>
                  {state.operation === Operation.Update ? t('general.item-modified') : t('general.item-created')}: {modifiedInfo}
                  <br />
                  {state.operation === Operation.Update ? t('general.item-modifier') : t('general.item-creator')}: {modifier || t('general.unknown')}
                </em>
              </IonText>
            </IonCol>
            <IonCol size="auto">
              <FormSelect
                label={t('fairwaycard.status')}
                selected={state.status}
                options={statusOptions}
                setSelected={updateState}
                actionType="status"
                hideLabel={true}
              />
            </IonCol>
            <IonCol size="auto">
              <IonButton shape="round" className="invert" routerLink="/">
                {t('general.cancel')}
              </IonButton>
              {state.operation === Operation.Update && (
                <IonButton
                  shape="round"
                  color="danger"
                  disabled={isError}
                  onClick={() => {
                    updateState(Status.Removed, 'status');
                    handleSubmit(true);
                  }}
                >
                  {t('general.delete')}
                </IonButton>
              )}
              <IonButton
                shape="round"
                disabled={isError || isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces}
                onClick={() => handleSubmit()}
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
              <FormTextInputRow
                labelKey="fairwaycard.name"
                value={state.name}
                updateState={updateState}
                actionType="name"
                required
                error={validationErrors.find((error) => error.id === 'name')?.msg}
              />
              <IonRow>
                <IonCol size="3">
                  <FormInput
                    label={t('fairwaycard.primary-id')}
                    val={state.id}
                    setValue={updateState}
                    actionType="primaryId"
                    required
                    disabled={state.operation === Operation.Update}
                    error={validationErrors.find((error) => error.id === 'primaryId')?.msg}
                    helperText={t('fairwaycard.primary-id-help-text')}
                  />
                </IonCol>
                <IonCol size="3">
                  <FormSelect
                    label={t('fairwaycard.linked-fairways')}
                    selected={state.fairwayIds || []}
                    options={fairwayList?.fairways || []}
                    setSelected={updateState}
                    actionType="fairwayIds"
                    multiple
                    required
                    showId
                    error={validationErrors.find((error) => error.id === 'fairwayIds')?.msg}
                    isLoading={isLoadingFairways}
                  />
                </IonCol>
                <IonCol size="3">
                  <FormSelect
                    label={t('fairwaycard.starting-fairway')}
                    selected={state.primaryFairwayId || ''}
                    options={fairwaySelection || []}
                    setSelected={updateState}
                    actionType="fairwayPrimary"
                    required
                    showId
                    disabled={state.fairwayIds.length < 2}
                    helperText={t('fairwaycard.fairway-order-help-text')}
                    isLoading={isLoadingFairways}
                  />
                </IonCol>
                <IonCol size="3">
                  <FormSelect
                    label={t('fairwaycard.ending-fairway')}
                    selected={state.secondaryFairwayId || ''}
                    options={fairwaySelection || []}
                    setSelected={updateState}
                    actionType="fairwaySecondary"
                    required
                    showId
                    disabled={state.fairwayIds.length < 2}
                    helperText={t('fairwaycard.fairway-order-help-text')}
                    isLoading={isLoadingFairways}
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="3">
                  <FormSelect
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
                    error={validationErrors.find((error) => error.id === 'group')?.msg}
                  />
                </IonCol>
                <IonCol size="3">
                  <FormSelect
                    label={t('general.item-referencelevel')}
                    selected={state.n2000HeightSystem}
                    options={[
                      { name: { fi: 'MW' }, id: false },
                      { name: { fi: 'N2000' }, id: true },
                    ]}
                    setSelected={updateState}
                    actionType="referenceLevel"
                  />
                </IonCol>
                <IonCol size="3">
                  <FormSelect
                    label={t('fairwaycard.linked-harbours')}
                    selected={state.harbors || []}
                    options={harborSelection || []}
                    setSelected={updateState}
                    actionType="harbours"
                    multiple
                    isLoading={isLoadingHarbours}
                  />
                </IonCol>
                <IonCol size="3" className="no-border"></IonCol>
              </IonRow>
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.fairway-info')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <FormTextInputRow
                labelKey="fairwaycard.lining-and-marking"
                value={state.lineText}
                updateState={updateState}
                actionType="line"
                required={!!(state.lineText?.fi || state.lineText?.sv || state.lineText?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.design-speed"
                value={state.designSpeed}
                updateState={updateState}
                actionType="designSpeed"
                required={!!(state.designSpeed?.fi || state.designSpeed?.sv || state.designSpeed?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.speed-limit"
                value={state.speedLimit}
                updateState={updateState}
                actionType="speedLimit"
                required={!!(state.speedLimit?.fi || state.speedLimit?.sv || state.speedLimit?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.anchorage"
                value={state.anchorage}
                updateState={updateState}
                actionType="anchorage"
                required={!!(state.anchorage?.fi || state.anchorage?.sv || state.anchorage?.en)}
                inputType="textarea"
              />
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.navigation')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <FormTextInputRow
                labelKey="fairwaycard.navigation-condition"
                value={state.navigationCondition}
                updateState={updateState}
                actionType="navigationCondition"
                required={!!(state.navigationCondition?.fi || state.navigationCondition?.sv || state.navigationCondition?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.ice-condition"
                value={state.iceCondition}
                updateState={updateState}
                actionType="iceCondition"
                required={!!(state.iceCondition?.fi || state.iceCondition?.sv || state.iceCondition?.en)}
                inputType="textarea"
              />
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.recommendation')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <FormTextInputRow
                labelKey="fairwaycard.wind-recommendation"
                value={state.windRecommendation}
                updateState={updateState}
                actionType="windRecommendation"
                required={!!(state.windRecommendation?.fi || state.windRecommendation?.sv || state.windRecommendation?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.vessel-recommendation"
                value={state.vesselRecommendation}
                updateState={updateState}
                actionType="vesselRecommendation"
                required={!!(state.vesselRecommendation?.fi || state.vesselRecommendation?.sv || state.vesselRecommendation?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.visibility-recommendation"
                value={state.visibility}
                updateState={updateState}
                actionType="visibility"
                required={!!(state.visibility?.fi || state.visibility?.sv || state.visibility?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.wind-gauge"
                value={state.windGauge}
                updateState={updateState}
                actionType="windGauge"
                required={!!(state.windGauge?.fi || state.windGauge?.sv || state.windGauge?.en)}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.sea-level"
                value={state.seaLevel}
                updateState={updateState}
                actionType="seaLevel"
                required={!!(state.seaLevel?.fi || state.seaLevel?.sv || state.seaLevel?.en)}
                inputType="textarea"
              />
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.traffic-services')}</h2>
              <h3>{t('fairwaycard.pilot-order')}</h3>
            </IonText>
            <IonGrid className="formGrid">
              <IonRow>
                <IonCol>
                  <FormInput
                    label={t('general.email')}
                    val={state.trafficService?.pilot?.email || ''}
                    setValue={updateState}
                    actionType="pilotEmail"
                    inputType="email"
                  />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('general.phone-number')}
                    val={state.trafficService?.pilot?.phoneNumber || ''}
                    setValue={updateState}
                    actionType="pilotPhone"
                    inputType="tel"
                  />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('general.fax')}
                    val={state.trafficService?.pilot?.fax || ''}
                    setValue={updateState}
                    actionType="pilotFax"
                    inputType="tel"
                  />
                </IonCol>
              </IonRow>
              <FormTextInputRow
                labelKey="general.additional-information"
                value={state.trafficService?.pilot?.extraInfo}
                updateState={updateState}
                actionType="pilotExtraInfo"
                required={
                  !!(
                    state.trafficService?.pilot?.extraInfo?.fi ||
                    state.trafficService?.pilot?.extraInfo?.sv ||
                    state.trafficService?.pilot?.extraInfo?.en
                  )
                }
                inputType="textarea"
              />
              <IonRow>
                <IonCol size="6">
                  <FormSelect
                    label={t('fairwaycard.linked-pilot-places')}
                    selected={(state.trafficService?.pilot?.places as PilotPlaceInput[]) || []}
                    options={pilotPlaceList?.pilotPlaces || []}
                    setSelected={updateState}
                    actionType="pilotPlaces"
                    multiple
                    compareObjects
                    isLoading={isLoadingPilotPlaces}
                  />
                </IonCol>
                {state.trafficService?.pilot?.places?.map((place) => {
                  const pilotPlace = place as PilotPlace;
                  const pilotName = (pilotPlace.name && (pilotPlace.name[lang] || pilotPlace.name.fi)) || pilotPlace.id.toString();
                  return (
                    <IonCol key={place.id}>
                      <FormInput
                        label={t('fairwaycard.pilotage-distance-from') + ' ' + pilotName}
                        val={place.pilotJourney}
                        setValue={updateState}
                        actionType="pilotJourney"
                        actionTarget={place.id}
                        unit="nm"
                        inputType="number"
                        max={999.9}
                        decimalCount={1}
                      />
                    </IonCol>
                  );
                })}
              </IonRow>
            </IonGrid>

            <FormOptionalSection
              title={t('fairwaycard.vts-heading')}
              sections={state.trafficService?.vts as VtsInput[]}
              updateState={updateState}
              sectionType="vts"
              validationErrors={validationErrors}
            />

            <FormOptionalSection
              title={t('fairwaycard.tug-heading')}
              sections={state.trafficService?.tugs as TugInput[]}
              updateState={updateState}
              sectionType="tug"
              validationErrors={validationErrors}
            />
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

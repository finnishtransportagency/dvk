import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ConfirmationType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
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
import { useHistory } from 'react-router';
import { diff } from 'deep-object-diff';
import NotificationModal from './NofiticationModal';

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
  const harbourSelection = harbourList?.harbors.filter((item) => item.n2000HeightSystem === state.n2000HeightSystem && item.status === Status.Public);
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

  useEffect(() => {
    setState(fairwayCard);
  }, [fairwayCard]);

  // Confirmation modal
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('');

  const history = useHistory();
  const backToList = () => {
    history.push({ pathname: '/' });
  };

  const handleCancel = () => {
    const diffObj = diff(fairwayCard, state);
    if (JSON.stringify(diffObj) === '{}') {
      backToList();
    } else {
      setConfirmationType('cancel');
    }
  };

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

  const saveCard = useCallback(() => {
    const currentCard = {
      ...state,
      trafficService: {
        ...state.trafficService,
        pilot: {
          ...state.trafficService?.pilot,
          places: state.trafficService?.pilot?.places?.map((place) => {
            return { id: place.id, pilotJourney: place.pilotJourney || undefined };
          }),
        },
      },
    };
    console.log(currentCard);
    saveFairwayCard({ card: currentCard as FairwayCardInput });
  }, [state, saveFairwayCard]);

  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (isRemove = false) => {
    if (isRemove) updateState(Status.Removed, 'status');
    // Manual validations for required fields
    let primaryIdErrorMsg = '';
    if (state.operation === Operation.Create) {
      if (reservedFairwayCardIds?.includes(state.id.trim())) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
      if (state.id.trim().length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    }
    const manualValidations = [
      { id: 'name', msg: !state.name.fi.trim() || !state.name.sv.trim() || !state.name.en.trim() ? t(ErrorMessageKeys?.required) : '' },
      { id: 'primaryId', msg: primaryIdErrorMsg },
      { id: 'fairwayIds', msg: state.fairwayIds.length < 1 ? t(ErrorMessageKeys?.required) : '' },
      { id: 'group', msg: state.group.length < 1 ? t(ErrorMessageKeys?.required) : '' },
      {
        id: 'vtsName',
        msg:
          (state.trafficService?.vts?.filter((vtsItem) => !vtsItem?.name.fi.trim() || !vtsItem?.name.sv.trim() || !vtsItem?.name.en.trim()) || [])
            .length > 0
            ? t(ErrorMessageKeys?.required)
            : '',
      },
      {
        id: 'vhfChannel',
        msg:
          (state.trafficService?.vts?.filter((vtsItem) => (vtsItem?.vhf?.filter((vhfItem) => !vhfItem?.channel.trim()) || []).length > 0) || [])
            .length > 0
            ? t(ErrorMessageKeys?.required)
            : '',
      },
      {
        id: 'tugName',
        msg:
          (state.trafficService?.tugs?.filter((tugItem) => !tugItem?.name.fi.trim() || !tugItem?.name.sv.trim() || !tugItem?.name.en.trim()) || [])
            .length > 0
            ? t(ErrorMessageKeys?.required)
            : '',
      },
    ];
    setValidationErrors(manualValidations);

    if (formRef.current?.checkValidity() && manualValidations.filter((error) => error.msg.length > 0).length < 1) {
      if (
        (state.operation === Operation.Create && state.status === Status.Draft) ||
        (state.status === Status.Draft && fairwayCard.status === Status.Draft && !isRemove)
      ) {
        saveCard();
      } else {
        setConfirmationType('save');
      }
    } else {
      setSaveError('MISSING-INFORMATION');
    }
  };

  const getModifiedInfo = () => {
    if (savedCard) return t('general.datetimeFormat', { val: savedCard.modificationTimestamp || savedCard.creationTimestamp });
    return modified ? t('general.datetimeFormat', { val: modified }) : '-';
  };

  const closeNotification = () => {
    setSaveError('');
    if (!saveError && !!savedCard) {
      if (state.operation === Operation.Update) history.go(0);
      if (state.operation === Operation.Create) history.push({ pathname: '/vaylakortti/' + savedCard.id });
    }
  };

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
        isOpen={!!saveError || !!savedCard}
        closeAction={closeNotification}
        header={(saveError ? t('general.save-failed') : t('general.save-successful')) || ''}
        subHeader={
          (saveError
            ? t('general.error-' + saveError)
            : t('modal.saved-fairwaycard-by-name', { name: savedCard?.name[lang] || savedCard?.name.fi })) || ''
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
                        {savedCard?.modifier || savedCard?.creator || modifier || t('general.unknown')}
                      </em>
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
            <IonCol size="auto">
              <FormSelect
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
              {state.operation === Operation.Update && fairwayCard.status !== Status.Removed && (
                <IonButton
                  shape="round"
                  color="danger"
                  disabled={isError || isLoadingMutation || isLoadingFairways || isLoadingHarbours || isLoadingPilotPlaces}
                  onClick={() => {
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
                disabled={fairwayCard.status === Status.Removed}
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
                    error={state.operation === Operation.Update ? '' : validationErrors.find((error) => error.id === 'primaryId')?.msg}
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
                    disabled={fairwayCard.status === Status.Removed}
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
                    disabled={state.fairwayIds.length < 2 || fairwayCard.status === Status.Removed}
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
                    disabled={state.fairwayIds.length < 2 || fairwayCard.status === Status.Removed}
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
                    disabled={fairwayCard.status === Status.Removed}
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
                    disabled={fairwayCard.status === Status.Removed}
                  />
                </IonCol>
                <IonCol size="3">
                  <FormSelect
                    label={t('fairwaycard.linked-harbours')}
                    selected={state.harbors || []}
                    options={harbourSelection || []}
                    setSelected={updateState}
                    actionType="harbours"
                    multiple
                    isLoading={isLoadingHarbours}
                    disabled={fairwayCard.status === Status.Removed}
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
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.design-speed"
                value={state.designSpeed}
                updateState={updateState}
                actionType="designSpeed"
                required={!!(state.designSpeed?.fi || state.designSpeed?.sv || state.designSpeed?.en)}
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.speed-limit"
                value={state.speedLimit}
                updateState={updateState}
                actionType="speedLimit"
                required={!!(state.speedLimit?.fi || state.speedLimit?.sv || state.speedLimit?.en)}
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.anchorage"
                value={state.anchorage}
                updateState={updateState}
                actionType="anchorage"
                required={!!(state.anchorage?.fi || state.anchorage?.sv || state.anchorage?.en)}
                disabled={fairwayCard.status === Status.Removed}
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
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.ice-condition"
                value={state.iceCondition}
                updateState={updateState}
                actionType="iceCondition"
                required={!!(state.iceCondition?.fi || state.iceCondition?.sv || state.iceCondition?.en)}
                disabled={fairwayCard.status === Status.Removed}
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
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.vessel-recommendation"
                value={state.vesselRecommendation}
                updateState={updateState}
                actionType="vesselRecommendation"
                required={!!(state.vesselRecommendation?.fi || state.vesselRecommendation?.sv || state.vesselRecommendation?.en)}
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.visibility-recommendation"
                value={state.visibility}
                updateState={updateState}
                actionType="visibility"
                required={!!(state.visibility?.fi || state.visibility?.sv || state.visibility?.en)}
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.wind-gauge"
                value={state.windGauge}
                updateState={updateState}
                actionType="windGauge"
                required={!!(state.windGauge?.fi || state.windGauge?.sv || state.windGauge?.en)}
                disabled={fairwayCard.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.sea-level"
                value={state.seaLevel}
                updateState={updateState}
                actionType="seaLevel"
                required={!!(state.seaLevel?.fi || state.seaLevel?.sv || state.seaLevel?.en)}
                disabled={fairwayCard.status === Status.Removed}
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
                    disabled={fairwayCard.status === Status.Removed}
                    inputType="email"
                  />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('general.phone-number')}
                    val={state.trafficService?.pilot?.phoneNumber || ''}
                    setValue={updateState}
                    actionType="pilotPhone"
                    disabled={fairwayCard.status === Status.Removed}
                    inputType="tel"
                  />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('general.fax')}
                    val={state.trafficService?.pilot?.fax || ''}
                    setValue={updateState}
                    actionType="pilotFax"
                    disabled={fairwayCard.status === Status.Removed}
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
                disabled={fairwayCard.status === Status.Removed}
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
                    disabled={fairwayCard.status === Status.Removed}
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
                        disabled={fairwayCard.status === Status.Removed}
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
              disabled={fairwayCard.status === Status.Removed}
            />

            <FormOptionalSection
              title={t('fairwaycard.tug-heading')}
              sections={state.trafficService?.tugs as TugInput[]}
              updateState={updateState}
              sectionType="tug"
              validationErrors={validationErrors}
              disabled={fairwayCard.status === Status.Removed}
            />
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

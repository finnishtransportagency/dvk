import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ActionTypeSelect, Lang, ValueType } from '../utils/constants';
import { ContentType, FairwayCardInput, Operation, Status } from '../graphql/generated';
import { useFairwayCardsAndHarborsQueryData, useFairwaysQueryData, useHarboursQueryData } from '../graphql/api';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextInputRow from './FormTextInputRow';

interface FormProps {
  fairwayCard: FairwayCardInput;
  isLoading?: boolean;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

const FairwayCardForm: React.FC<FormProps> = ({ fairwayCard, isLoading, modified, modifier, isError }) => {
  const { t } = useTranslation();

  const { data: fairwayList, isLoading: isLoadingFairways } = useFairwaysQueryData();
  const { data: harbourList, isLoading: isLoadingHarbours } = useHarboursQueryData();
  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();

  const [state, setState] = useState<FairwayCardInput>(fairwayCard);
  const fairwaySelection = fairwayList?.fairways.filter((item) => state.fairwayIds.includes(item.id));
  const modifiedInfo = modified ? t('general.datetimeFormat', { val: modified }) : '-';
  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (fairwayCard.status !== Status.Draft) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

  const [validationErrors, setValidationErrors] = useState({ primaryId: '' });
  const reservedFairwayIds = fairwaysAndHarbours?.fairwayCardsAndHarbors.filter((item) => item.type === ContentType.Card).flatMap((item) => item.id);

  const updateState = (value: ValueType, actionType: ActionType | ActionTypeSelect, actionLang?: Lang) => {
    console.log('updateState... for input ' + actionType, actionLang);
    // Check manual validations
    if (actionType === 'primaryId' && state.operation === Operation.Create) {
      setValidationErrors({
        ...validationErrors,
        primaryId: reservedFairwayIds?.includes(value as string) ? t('fairwaycard.error-duplicate-id') : '',
      });
    }

    let newState;
    switch (actionType) {
      case 'name':
        if (!actionLang) return state;
        newState = { ...state, name: { ...state.name, [actionLang as string]: value as string } };
        break;
      case 'primaryId':
        newState = { ...state, id: value as string };
        break;
      case 'status':
        newState = { ...state, status: value as Status };
        break;
      case 'fairwayIds':
        newState = {
          ...state,
          fairwayIds: value as number[],
        };
        if (!(value as number[]).includes(state.primaryFairwayId || -1)) delete newState.primaryFairwayId;
        if (!(value as number[]).includes(state.secondaryFairwayId || -1)) delete newState.secondaryFairwayId;
        if ((value as number[]).length === 1) {
          newState.primaryFairwayId = (value as number[])[0];
          newState.secondaryFairwayId = (value as number[])[0];
        }
        break;
      case 'fairwayPrimary':
        newState = { ...state, primaryFairwayId: Number(value) };
        break;
      case 'fairwaySecondary':
        newState = { ...state, secondaryFairwayId: Number(value) };
        break;
      case 'harbours':
        newState = { ...state, harbors: value as string[] };
        break;
      case 'referenceLevel':
        newState = { ...state, n2000HeightSystem: !!value };
        break;
      case 'line':
        if (!actionLang) return state;
        newState = {
          ...state,
          lineText: {
            ...(state.lineText || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'speedLimit':
        if (!actionLang) return state;
        newState = {
          ...state,
          speedLimit: {
            ...(state.speedLimit || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'designSpeed':
        if (!actionLang) return state;
        newState = {
          ...state,
          designSpeed: {
            ...(state.designSpeed || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'anchorage':
        if (!actionLang) return state;
        newState = {
          ...state,
          anchorage: {
            ...(state.anchorage || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'navigationCondition':
        if (!actionLang) return state;
        newState = {
          ...state,
          navigationCondition: {
            ...(state.navigationCondition || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'iceCondition':
        if (!actionLang) return state;
        newState = {
          ...state,
          iceCondition: {
            ...(state.iceCondition || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'windRecommendation':
        if (!actionLang) return state;
        newState = {
          ...state,
          windRecommendation: {
            ...(state.windRecommendation || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'vesselRecommendation':
        if (!actionLang) return state;
        newState = {
          ...state,
          vesselRecommendation: {
            ...(state.vesselRecommendation || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'visibility':
        if (!actionLang) return state;
        newState = {
          ...state,
          visibility: {
            ...(state.visibility || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'windGauge':
        if (!actionLang) return state;
        newState = {
          ...state,
          windGauge: {
            ...(state.windGauge || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'seaLevel':
        if (!actionLang) return state;
        newState = {
          ...state,
          seaLevel: {
            ...(state.seaLevel || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      default:
        console.warn(`Unknown action type, state not updated.`);
        return state;
    }
    setState(newState);
  };

  useEffect(() => {
    setState(fairwayCard);
  }, [fairwayCard]);

  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = () => {
    console.log('...submitting... isFormValid? ' + formRef.current?.checkValidity());
    console.log(state, validationErrors);
    formRef.current?.reportValidity();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonGrid className="optionBar">
          <IonRow>
            <IonCol className="ion-align-self-center align-right">
              <IonText>
                <em>
                  {state.operation === Operation.Update ? t('general.item-modified') : t('general.item-created')}:{' '}
                  {isLoading ? (
                    <IonSkeletonText
                      animated={true}
                      style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
                    />
                  ) : (
                    modifiedInfo
                  )}
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
                <IonButton shape="round" color="danger" disabled={isError}>
                  {t('general.delete')}
                </IonButton>
              )}
              <IonButton shape="round" disabled={isError} onClick={() => handleSubmit()}>
                {state.operation === Operation.Update ? t('general.save') : t('general.create-new')}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonHeader>

      <IonContent className="mainContent ion-no-padding" data-testid="fairwayCardEditPage">
        {isError && <p>{t('general.loading-error')}</p>}
        {isLoading && <IonProgressBar type="indeterminate" />}

        {!isLoading && !isError && (
          <form ref={formRef}>
            <IonGrid className="formGrid">
              <FormTextInputRow labelKey="fairwaycard.name" value={state.name} updateState={updateState} actionType="name" required />
              <IonRow>
                <IonCol size="3">
                  <FormInput
                    label={t('fairwaycard.primary-id')}
                    val={state.id}
                    setValue={updateState}
                    actionType="primaryId"
                    required
                    disabled={state.operation === Operation.Update}
                    error={validationErrors.primaryId}
                    helperText={t('fairwaycard.primary-id-help-text')}
                  />
                </IonCol>
                <IonCol size="3">
                  {!isLoadingFairways && (
                    <FormSelect
                      label={t('fairwaycard.linked-fairways')}
                      selected={state.fairwayIds || []}
                      options={fairwayList?.fairways || []}
                      setSelected={updateState}
                      actionType="fairwayIds"
                      multiple
                      required
                      showId
                    />
                  )}
                </IonCol>
                <IonCol size="3">
                  {!isLoadingHarbours && (
                    <FormSelect
                      label={t('fairwaycard.linked-harbours')}
                      selected={state.harbors || []}
                      options={harbourList?.harbors || []}
                      setSelected={updateState}
                      actionType="harbours"
                      multiple
                    />
                  )}
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
              </IonRow>
              <IonRow>
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
                  />
                </IonCol>
                <IonCol size="6"></IonCol>
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
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.design-speed"
                value={state.designSpeed}
                updateState={updateState}
                actionType="designSpeed"
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.speed-limit"
                value={state.speedLimit}
                updateState={updateState}
                actionType="speedLimit"
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.anchorage"
                value={state.anchorage}
                updateState={updateState}
                actionType="anchorage"
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
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.ice-condition"
                value={state.iceCondition}
                updateState={updateState}
                actionType="iceCondition"
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
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.vessel-recommendation"
                value={state.vesselRecommendation}
                updateState={updateState}
                actionType="vesselRecommendation"
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.visibility-recommendation"
                value={state.visibility}
                updateState={updateState}
                actionType="visibility"
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.wind-gauge"
                value={state.windGauge}
                updateState={updateState}
                actionType="windGauge"
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="fairwaycard.sea-level"
                value={state.seaLevel}
                updateState={updateState}
                actionType="seaLevel"
                inputType="textarea"
              />
            </IonGrid>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

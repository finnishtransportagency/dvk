import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ActionTypeSelect, ValueType } from '../utils/constants';
import { ContentType, FairwayCardInput, Operation, Status } from '../graphql/generated';
import { useFairwayCardsAndHarborsQueryData, useFairwaysQueryData, useHarboursQueryData } from '../graphql/api';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

interface FormProps {
  fairwayCard: FairwayCardInput;
  isLoading?: boolean;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

const FairwayCardForm: React.FC<FormProps> = ({ fairwayCard, isLoading, modified, modifier, isError }) => {
  const { t, i18n } = useTranslation();
  const fi = i18n.getFixedT('fi');
  const sv = i18n.getFixedT('sv');
  const en = i18n.getFixedT('en');

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

  const updateState = (value: ValueType, actionType: ActionType | ActionTypeSelect) => {
    console.log('updateState... for input ' + actionType);
    // Check manual validations
    if (actionType === 'primaryId' && state.operation === Operation.Create) {
      setValidationErrors({
        ...validationErrors,
        primaryId: reservedFairwayIds?.includes(value as string) ? t('fairwaycard.error-duplicate-id') : '',
      });
    }

    let newState;
    switch (actionType) {
      case 'nameFi':
        newState = { ...state, name: { ...state.name, fi: value as string } };
        break;
      case 'nameSv':
        newState = { ...state, name: { ...state.name, sv: value as string } };
        break;
      case 'nameEn':
        newState = { ...state, name: { ...state.name, en: value as string } };
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
      case 'lineFi':
        newState = { ...state, lineText: { fi: value as string, sv: state.lineText?.sv || '', en: state.lineText?.en || '' } };
        break;
      case 'lineSv':
        newState = { ...state, lineText: { fi: state.lineText?.fi || '', sv: value as string, en: state.lineText?.en || '' } };
        break;
      case 'lineEn':
        newState = { ...state, lineText: { fi: state.lineText?.fi || '', sv: state.lineText?.sv || '', en: value as string } };
        break;
      case 'speedLimitFi':
        newState = { ...state, speedLimit: { fi: value as string, sv: state.speedLimit?.sv || '', en: state.speedLimit?.en || '' } };
        break;
      case 'speedLimitSv':
        newState = { ...state, speedLimit: { fi: state.speedLimit?.fi || '', sv: value as string, en: state.speedLimit?.en || '' } };
        break;
      case 'speedLimitEn':
        newState = { ...state, speedLimit: { fi: state.speedLimit?.fi || '', sv: state.speedLimit?.sv || '', en: value as string } };
        break;
      case 'designSpeedFi':
        newState = { ...state, designSpeed: { fi: value as string, sv: state.designSpeed?.sv || '', en: state.designSpeed?.en || '' } };
        break;
      case 'designSpeedSv':
        newState = { ...state, designSpeed: { fi: state.designSpeed?.fi || '', sv: value as string, en: state.designSpeed?.en || '' } };
        break;
      case 'designSpeedEn':
        newState = { ...state, designSpeed: { fi: state.designSpeed?.fi || '', sv: state.designSpeed?.sv || '', en: value as string } };
        break;
      case 'anchorageFi':
        newState = { ...state, anchorage: { fi: value as string, sv: state.anchorage?.sv || '', en: state.anchorage?.en || '' } };
        break;
      case 'anchorageSv':
        newState = { ...state, anchorage: { fi: state.anchorage?.fi || '', sv: value as string, en: state.anchorage?.en || '' } };
        break;
      case 'anchorageEn':
        newState = { ...state, anchorage: { fi: state.anchorage?.fi || '', sv: state.anchorage?.sv || '', en: value as string } };
        break;
      case 'navigationConditionFi':
        newState = {
          ...state,
          navigationCondition: { fi: value as string, sv: state.navigationCondition?.sv || '', en: state.navigationCondition?.en || '' },
        };
        break;
      case 'navigationConditionSv':
        newState = {
          ...state,
          navigationCondition: { fi: state.navigationCondition?.fi || '', sv: value as string, en: state.navigationCondition?.en || '' },
        };
        break;
      case 'navigationConditionEn':
        newState = {
          ...state,
          navigationCondition: { fi: state.navigationCondition?.fi || '', sv: state.navigationCondition?.sv || '', en: value as string },
        };
        break;
      case 'iceConditionFi':
        newState = { ...state, iceCondition: { fi: value as string, sv: state.iceCondition?.sv || '', en: state.iceCondition?.en || '' } };
        break;
      case 'iceConditionSv':
        newState = { ...state, iceCondition: { fi: state.iceCondition?.fi || '', sv: value as string, en: state.iceCondition?.en || '' } };
        break;
      case 'iceConditionEn':
        newState = { ...state, iceCondition: { fi: state.iceCondition?.fi || '', sv: state.iceCondition?.sv || '', en: value as string } };
        break;
      case 'windRecommendationFi':
        newState = {
          ...state,
          windRecommendation: { fi: value as string, sv: state.windRecommendation?.sv || '', en: state.windRecommendation?.en || '' },
        };
        break;
      case 'windRecommendationSv':
        newState = {
          ...state,
          windRecommendation: { fi: state.windRecommendation?.fi || '', sv: value as string, en: state.windRecommendation?.en || '' },
        };
        break;
      case 'windRecommendationEn':
        newState = {
          ...state,
          windRecommendation: { fi: state.windRecommendation?.fi || '', sv: state.windRecommendation?.sv || '', en: value as string },
        };
        break;
      case 'vesselRecommendationFi':
        newState = {
          ...state,
          vesselRecommendation: { fi: value as string, sv: state.vesselRecommendation?.sv || '', en: state.vesselRecommendation?.en || '' },
        };
        break;
      case 'vesselRecommendationSv':
        newState = {
          ...state,
          vesselRecommendation: { fi: state.vesselRecommendation?.fi || '', sv: value as string, en: state.vesselRecommendation?.en || '' },
        };
        break;
      case 'vesselRecommendationEn':
        newState = {
          ...state,
          vesselRecommendation: { fi: state.vesselRecommendation?.fi || '', sv: state.vesselRecommendation?.sv || '', en: value as string },
        };
        break;
      case 'visibilityFi':
        newState = { ...state, visibility: { fi: value as string, sv: state.visibility?.sv || '', en: state.visibility?.en || '' } };
        break;
      case 'visibilitySv':
        newState = { ...state, visibility: { fi: state.visibility?.fi || '', sv: value as string, en: state.visibility?.en || '' } };
        break;
      case 'visibilityEn':
        newState = { ...state, visibility: { fi: state.visibility?.fi || '', sv: state.visibility?.sv || '', en: value as string } };
        break;
      case 'windGaugeFi':
        newState = { ...state, windGauge: { fi: value as string, sv: state.windGauge?.sv || '', en: state.windGauge?.en || '' } };
        break;
      case 'windGaugeSv':
        newState = { ...state, windGauge: { fi: state.windGauge?.fi || '', sv: value as string, en: state.windGauge?.en || '' } };
        break;
      case 'windGaugeEn':
        newState = { ...state, windGauge: { fi: state.windGauge?.fi || '', sv: state.windGauge?.sv || '', en: value as string } };
        break;
      case 'seaLevelFi':
        newState = { ...state, seaLevel: { fi: value as string, sv: state.seaLevel?.sv || '', en: state.seaLevel?.en || '' } };
        break;
      case 'seaLevelSv':
        newState = { ...state, seaLevel: { fi: state.seaLevel?.fi || '', sv: value as string, en: state.seaLevel?.en || '' } };
        break;
      case 'seaLevelEn':
        newState = { ...state, seaLevel: { fi: state.seaLevel?.fi || '', sv: state.seaLevel?.sv || '', en: value as string } };
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

        {!isLoading && !isError && (
          <form ref={formRef}>
            <IonGrid className="formGrid">
              <IonRow>
                <IonCol>
                  <FormInput label={fi('fairwaycard.name') + ' (fi)'} val={state.name.fi} setValue={updateState} actionType="nameFi" required />
                </IonCol>
                <IonCol>
                  <FormInput label={sv('fairwaycard.name') + ' (sv)'} val={state.name.sv} setValue={updateState} actionType="nameSv" required />
                </IonCol>
                <IonCol>
                  <FormInput label={en('fairwaycard.name') + ' (en)'} val={state.name.en} setValue={updateState} actionType="nameEn" required />
                </IonCol>
              </IonRow>
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
                    helperText={t('fairwaycard.fairway-order-help-text') || ''}
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
                    helperText={t('fairwaycard.fairway-order-help-text') || ''}
                  />
                </IonCol>
                <IonCol size="6"></IonCol>
              </IonRow>
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.fairway-info')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.lining-and-marking') + ' (fi)'}
                    val={state.lineText?.fi || ''}
                    setValue={updateState}
                    actionType="lineFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.lining-and-marking') + ' (sv)'}
                    val={state.lineText?.sv || ''}
                    setValue={updateState}
                    actionType="lineSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.lining-and-marking') + ' (en)'}
                    val={state.lineText?.en || ''}
                    setValue={updateState}
                    actionType="lineEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.design-speed') + ' (fi)'}
                    val={state.designSpeed?.fi || ''}
                    setValue={updateState}
                    actionType="designSpeedFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.design-speed') + ' (sv)'}
                    val={state.designSpeed?.sv || ''}
                    setValue={updateState}
                    actionType="designSpeedSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.design-speed') + ' (en)'}
                    val={state.designSpeed?.en || ''}
                    setValue={updateState}
                    actionType="designSpeedEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.speed-limit') + ' (fi)'}
                    val={state.speedLimit?.fi || ''}
                    setValue={updateState}
                    actionType="speedLimitFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.speed-limit') + ' (sv)'}
                    val={state.speedLimit?.sv || ''}
                    setValue={updateState}
                    actionType="speedLimitSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.speed-limit') + ' (en)'}
                    val={state.speedLimit?.en || ''}
                    setValue={updateState}
                    actionType="speedLimitEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.anchorage') + ' (fi)'}
                    val={state.anchorage?.fi || ''}
                    setValue={updateState}
                    actionType="anchorageFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.anchorage') + ' (sv)'}
                    val={state.anchorage?.sv || ''}
                    setValue={updateState}
                    actionType="anchorageSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.anchorage') + ' (en)'}
                    val={state.anchorage?.en || ''}
                    setValue={updateState}
                    actionType="anchorageEn"
                  />
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.navigation')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.navigation-condition') + ' (fi)'}
                    val={state.navigationCondition?.fi || ''}
                    setValue={updateState}
                    actionType="navigationConditionFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.navigation-condition') + ' (sv)'}
                    val={state.navigationCondition?.sv || ''}
                    setValue={updateState}
                    actionType="navigationConditionSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.navigation-condition') + ' (en)'}
                    val={state.navigationCondition?.en || ''}
                    setValue={updateState}
                    actionType="navigationConditionEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.ice-condition') + ' (fi)'}
                    val={state.iceCondition?.fi || ''}
                    setValue={updateState}
                    actionType="iceConditionFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.ice-condition') + ' (sv)'}
                    val={state.iceCondition?.sv || ''}
                    setValue={updateState}
                    actionType="iceConditionSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.ice-condition') + ' (en)'}
                    val={state.iceCondition?.en || ''}
                    setValue={updateState}
                    actionType="iceConditionEn"
                  />
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonText>
              <h2>{t('fairwaycard.recommendation')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.wind-recommendation') + ' (fi)'}
                    val={state.windRecommendation?.fi || ''}
                    setValue={updateState}
                    actionType="windRecommendationFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.wind-recommendation') + ' (sv)'}
                    val={state.windRecommendation?.sv || ''}
                    setValue={updateState}
                    actionType="windRecommendationSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.wind-recommendation') + ' (en)'}
                    val={state.windRecommendation?.en || ''}
                    setValue={updateState}
                    actionType="windRecommendationEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.vessel-recommendation') + ' (fi)'}
                    val={state.vesselRecommendation?.fi || ''}
                    setValue={updateState}
                    actionType="vesselRecommendationFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.vessel-recommendation') + ' (sv)'}
                    val={state.vesselRecommendation?.sv || ''}
                    setValue={updateState}
                    actionType="vesselRecommendationSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.vessel-recommendation') + ' (en)'}
                    val={state.vesselRecommendation?.en || ''}
                    setValue={updateState}
                    actionType="vesselRecommendationEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.visibility-recommendation') + ' (fi)'}
                    val={state.visibility?.fi || ''}
                    setValue={updateState}
                    actionType="visibilityFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.visibility-recommendation') + ' (sv)'}
                    val={state.visibility?.sv || ''}
                    setValue={updateState}
                    actionType="visibilitySv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.visibility-recommendation') + ' (en)'}
                    val={state.visibility?.en || ''}
                    setValue={updateState}
                    actionType="visibilityEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.wind-gauge') + ' (fi)'}
                    val={state.windGauge?.fi || ''}
                    setValue={updateState}
                    actionType="windGaugeFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.wind-gauge') + ' (sv)'}
                    val={state.windGauge?.sv || ''}
                    setValue={updateState}
                    actionType="windGaugeSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.wind-gauge') + ' (en)'}
                    val={state.windGauge?.en || ''}
                    setValue={updateState}
                    actionType="windGaugeEn"
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormTextarea
                    label={fi('fairwaycard.sea-level') + ' (fi)'}
                    val={state.seaLevel?.fi || ''}
                    setValue={updateState}
                    actionType="seaLevelFi"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={sv('fairwaycard.sea-level') + ' (sv)'}
                    val={state.seaLevel?.sv || ''}
                    setValue={updateState}
                    actionType="seaLevelSv"
                  />
                </IonCol>
                <IonCol>
                  <FormTextarea
                    label={en('fairwaycard.sea-level') + ' (en)'}
                    val={state.seaLevel?.en || ''}
                    setValue={updateState}
                    actionType="seaLevelEn"
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

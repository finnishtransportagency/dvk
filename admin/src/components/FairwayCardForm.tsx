import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ActionTypeSelect } from '../utils/constants';
import { FairwayCardInput, Operation, Status } from '../graphql/generated';
import { useFairwaysQueryData, useHarboursQueryData } from '../graphql/api';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

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

  const { data: fairwayList, isLoading: isLoadingFairways, isFetching: isFetchingFairways } = useFairwaysQueryData();
  const { data: harbourList, isLoading: isLoadingHarbours, isFetching: isFetchingHarbours } = useHarboursQueryData();

  const [state, setState] = useState<FairwayCardInput>(fairwayCard);
  const fairwaySelection = fairwayList?.fairways.filter((item) => state.fairwayIds.includes(item.id));

  const updateState = (value?: string | null, actionType?: ActionType) => {
    console.log('updateState... for input ' + actionType);
    let newState;
    switch (actionType) {
      case 'nameFi':
        newState = { ...state, name: { ...state.name, fi: value || '' } };
        break;
      case 'nameSv':
        newState = { ...state, name: { ...state.name, sv: value || '' } };
        break;
      case 'nameEn':
        newState = { ...state, name: { ...state.name, en: value || '' } };
        break;
      case 'primaryId':
        newState = { ...state, id: value || '' };
        break;
      default:
        console.warn(`Unknown action type, state not updated.`);
        return state;
    }
    setState(newState);
  };
  const updateStateFromSelect = (actionType: ActionTypeSelect, value: boolean | number | string) => {
    console.log('updateState... for input ' + actionType);
    let newState = state;
    switch (actionType) {
      case 'status':
        newState = { ...state, status: value as Status };
        break;
      case 'referenceLevel':
        newState = { ...state, n2000HeightSystem: !!value };
        break;
      case 'fairwayPrimary':
        newState = { ...state, primaryFairwayId: Number(value) };
        break;
      case 'fairwaySecondary':
        newState = { ...state, secondaryFairwayId: Number(value) };
        break;
      default:
        console.warn(`Unknown action type, state not updated.`);
        return state;
    }
    setState(newState);
  };
  const updateStateFromSelectMultiple = (actionType: ActionTypeSelect, value: boolean | number | string, strArray: string[], numArray: number[]) => {
    console.log('updateState... for input ' + actionType, value);
    if (!Array.isArray(value)) return;
    let newState;
    switch (actionType) {
      case 'fairwayIds':
        newState = { ...state, fairwayIds: numArray };
        break;
      case 'harbours':
        newState = { ...state, harbors: strArray };
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
    console.log('...submitting...');
    console.log(formRef.current?.checkValidity());
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
                  ) : modified ? (
                    t('general.datetimeFormat', { val: modified })
                  ) : (
                    '-'
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
                options={[
                  { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
                  { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
                  { name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed },
                ]}
                setSelected={updateStateFromSelect}
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
              <IonButton shape="round" disabled>
                {t('general.preview')}
              </IonButton>
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
                  />
                </IonCol>
                <IonCol size="3">
                  {!isLoadingFairways && (
                    <>
                      <FormSelect
                        label={t('fairwaycard.linked-fairways')}
                        selected={state.fairwayIds || []}
                        options={fairwayList?.fairways || []}
                        setSelected={updateStateFromSelectMultiple}
                        actionType="fairwayIds"
                        disabled={isFetchingFairways}
                        required
                        showId
                      />
                      {state.fairwayIds.length > 1 && (
                        <IonGrid>
                          <IonRow>
                            <IonCol>
                              <FormSelect
                                label={t('fairwaycard.starting-fairway')}
                                selected={state.primaryFairwayId || ''}
                                options={fairwaySelection || []}
                                setSelected={updateStateFromSelect}
                                actionType="fairwayPrimary"
                                required
                                showId
                              />
                            </IonCol>
                            <IonCol>
                              <FormSelect
                                label={t('fairwaycard.ending-fairway')}
                                selected={state.secondaryFairwayId || ''}
                                options={fairwaySelection || []}
                                setSelected={updateStateFromSelect}
                                actionType="fairwaySecondary"
                                required
                                showId
                              />
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      )}
                    </>
                  )}
                </IonCol>
                <IonCol size="3">
                  {!isLoadingHarbours && (
                    <FormSelect
                      label={t('fairwaycard.linked-harbours')}
                      selected={state.harbors || []}
                      options={harbourList?.harbors || []}
                      setSelected={updateStateFromSelectMultiple}
                      actionType="harbours"
                      disabled={isFetchingHarbours}
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
                    setSelected={updateStateFromSelect}
                    actionType="referenceLevel"
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

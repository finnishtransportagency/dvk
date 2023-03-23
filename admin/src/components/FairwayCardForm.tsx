import React, { useEffect, useRef, useState } from 'react';
import {
  IonAlert,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonRow,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ActionTypeSelect, Lang, ValueType } from '../utils/constants';
import { ContentType, FairwayCard, FairwayCardInput, Operation, PilotPlace, Status, TugInput, VtsInput } from '../graphql/generated';
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

interface FormProps {
  fairwayCard: FairwayCardInput;
  isLoading?: boolean;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

type ValidationType = {
  id: string;
  msg: string;
};

const FairwayCardForm: React.FC<FormProps> = ({ fairwayCard, isLoading, modified, modifier, isError }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  const { data: fairwayList, isLoading: isLoadingFairways } = useFairwaysQueryData();
  const { data: harbourList, isLoading: isLoadingHarbours } = useHarboursQueryData();
  const { data: pilotPlaceList, isLoading: isLoadingPilotPlaces } = usePilotPlacesQueryData();
  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();

  const [state, setState] = useState<FairwayCardInput>(fairwayCard);
  const fairwaySelection = fairwayList?.fairways.filter((item) => state.fairwayIds.includes(item.id));
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

  const updateState = (
    value: ValueType,
    actionType: ActionType | ActionTypeSelect,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => {
    console.log('updateState... for input ' + actionType, actionLang);
    // Check manual validations and clear triggered validations by save
    if (actionType === 'primaryId' && state.operation === Operation.Create) {
      let primaryIdErrorMsg = '';
      if (reservedFairwayCardIds?.includes(value as string)) primaryIdErrorMsg = t('fairwaycard.error-duplicate-id');
      if ((value as string).length < 1) primaryIdErrorMsg = t('general.required-field');
      setValidationErrors((oldErrorList) => [
        ...oldErrorList.filter((error) => error.id !== 'primaryId'),
        { id: 'primaryId', msg: primaryIdErrorMsg },
      ]);
    } else if (actionType === 'name' && validationErrors.find((error) => error.id === 'name')?.msg) {
      setValidationErrors((oldErrorList) => [
        ...oldErrorList.filter((error) => error.id !== 'name'),
        { id: 'name', msg: (value as string).length < 1 ? t('general.required-field') : '' },
      ]);
    } else if (actionType === 'fairwayIds' && validationErrors.find((error) => error.id === 'fairwayIds')?.msg) {
      setValidationErrors((oldErrorList) => [
        ...oldErrorList.filter((error) => error.id !== 'fairwayIds'),
        { id: 'fairwayIds', msg: (value as number[]).length < 1 ? t('general.required-field') : '' },
      ]);
    }
    // TODO: add vts + tug name (and add clearing to save)

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
      case 'pilotEmail':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            pilot: {
              ...state.trafficService?.pilot,
              email: value as string,
            },
          },
        };
        break;
      case 'pilotPhone':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            pilot: {
              ...state.trafficService?.pilot,
              phoneNumber: value as string,
            },
          },
        };
        break;
      case 'pilotFax':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            pilot: {
              ...state.trafficService?.pilot,
              fax: value as string,
            },
          },
        };
        break;
      case 'pilotExtraInfo':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            pilot: {
              ...state.trafficService?.pilot,
              extraInfo: {
                ...(state.trafficService?.pilot?.extraInfo || { fi: '', sv: '', en: '' }),
                [actionLang as string]: value as string,
              },
            },
          },
        };
        break;
      case 'pilotPlaces':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            pilot: {
              ...state.trafficService?.pilot,
              places: value as PilotPlace[],
            },
          },
        };
        break;
      case 'pilotJourney':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            pilot: {
              ...state.trafficService?.pilot,
              places: state.trafficService?.pilot?.places?.map((place) =>
                place.id === actionTarget ? { ...place, pilotJourney: value as number } : place
              ),
            },
          },
        };
        break;
      case 'vts':
        // Add and delete
        if (value && !actionTarget) {
          newState = {
            ...state,
            trafficService: {
              ...state.trafficService,
              vts: state.trafficService?.vts?.concat([
                {
                  email: [],
                  name: { fi: '', sv: '', en: '' },
                  phoneNumber: '',
                  vhf: [],
                },
              ]),
            },
          };
        } else {
          newState = {
            ...state,
            trafficService: {
              ...state.trafficService,
              vts: state.trafficService?.vts?.filter((vtsItem, idx) => idx !== actionTarget),
            },
          };
        }
        break;
      case 'vtsName':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, idx) =>
              idx === actionTarget
                ? {
                    ...vtsItem,
                    name: {
                      ...(vtsItem?.name || { fi: '', sv: '', en: '' }),
                      [actionLang as string]: value as string,
                    },
                  }
                : vtsItem
            ),
          },
        };
        break;
      case 'vtsEmail':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, idx) =>
              idx === actionTarget
                ? {
                    ...vtsItem,
                    name: vtsItem?.name || { fi: '', sv: '', en: '' },
                    email: (value as string).split(',').map((item) => item.trim()),
                  }
                : vtsItem
            ),
          },
        };
        break;
      case 'vtsPhone':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, idx) =>
              idx === actionTarget
                ? {
                    ...vtsItem,
                    name: vtsItem?.name || { fi: '', sv: '', en: '' },
                    phoneNumber: ((value as string) || '').trim(),
                  }
                : vtsItem
            ),
          },
        };
        break;
      case 'vhf':
        // Add and delete
        if (value && actionOuterTarget !== undefined) {
          newState = {
            ...state,
            trafficService: {
              ...state.trafficService,
              vts: state.trafficService?.vts?.map((vtsItem, i) =>
                i === actionOuterTarget
                  ? {
                      ...vtsItem,
                      name: vtsItem?.name || { fi: '', sv: '', en: '' },
                      vhf: vtsItem?.vhf?.concat([{ channel: 0, name: { fi: '', sv: '', en: '' } }]),
                    }
                  : vtsItem
              ),
            },
          };
        } else if (!value && actionTarget !== undefined) {
          newState = {
            ...state,
            trafficService: {
              ...state.trafficService,
              vts: state.trafficService?.vts?.map((vtsItem) => {
                return {
                  ...vtsItem,
                  name: vtsItem?.name || { fi: '', sv: '', en: '' },
                  vhf: vtsItem?.vhf?.filter((vhfItem, idx) => idx !== actionTarget),
                };
              }),
            },
          };
        } else {
          return state;
        }
        break;
      case 'vhfName':
        if (actionTarget === undefined || actionOuterTarget === undefined) return state;
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, idx) =>
              idx === actionOuterTarget
                ? {
                    ...vtsItem,
                    name: vtsItem?.name || { fi: '', sv: '', en: '' },
                    vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                      j === actionTarget
                        ? {
                            name: {
                              ...(vhfItem?.name || { fi: '', sv: '', en: '' }),
                              [actionLang as string]: value as string,
                            },
                            channel: vhfItem?.channel || 0,
                          }
                        : vhfItem
                    ),
                  }
                : vtsItem
            ),
          },
        };
        break;
      case 'vhfChannel':
        if (actionTarget === undefined || actionOuterTarget === undefined) return state;
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            vts: state.trafficService?.vts?.map((vtsItem, idx) =>
              idx === actionOuterTarget
                ? {
                    ...vtsItem,
                    name: vtsItem?.name || { fi: '', sv: '', en: '' },
                    vhf: vtsItem?.vhf?.map((vhfItem, j) =>
                      j === actionTarget
                        ? {
                            name: vhfItem?.name || { fi: '', sv: '', en: '' },
                            channel: value as number,
                          }
                        : vhfItem
                    ),
                  }
                : vtsItem
            ),
          },
        };
        break;
      case 'tug':
        // Add and delete
        if (value && !actionTarget) {
          newState = {
            ...state,
            trafficService: {
              ...state.trafficService,
              tugs: state.trafficService?.tugs?.concat([
                {
                  email: '',
                  name: { fi: '', sv: '', en: '' },
                  phoneNumber: [],
                  fax: '',
                },
              ]),
            },
          };
        } else {
          newState = {
            ...state,
            trafficService: {
              ...state.trafficService,
              tugs: state.trafficService?.tugs?.filter((tugItem, idx) => idx !== actionTarget),
            },
          };
        }
        break;
      case 'tugName':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
              idx === actionTarget
                ? {
                    ...tugItem,
                    name: {
                      ...(tugItem?.name || { fi: '', sv: '', en: '' }),
                      [actionLang as string]: value as string,
                    },
                  }
                : tugItem
            ),
          },
        };
        break;
      case 'tugEmail':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
              idx === actionTarget
                ? {
                    ...tugItem,
                    name: tugItem?.name || { fi: '', sv: '', en: '' },
                    email: ((value as string) || '').trim(),
                  }
                : tugItem
            ),
          },
        };
        break;
      case 'tugPhone':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
              idx === actionTarget
                ? {
                    ...tugItem,
                    name: tugItem?.name || { fi: '', sv: '', en: '' },
                    phoneNumber: (value as string).split(',').map((item) => item.trim()),
                  }
                : tugItem
            ),
          },
        };
        break;
      case 'tugFax':
        newState = {
          ...state,
          trafficService: {
            ...state.trafficService,
            tugs: state.trafficService?.tugs?.map((tugItem, idx) =>
              idx === actionTarget
                ? {
                    ...tugItem,
                    name: tugItem?.name || { fi: '', sv: '', en: '' },
                    fax: ((value as string) || '').trim(),
                  }
                : tugItem
            ),
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

  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = () => {
    // Manual validations for required fields
    const manualValidations = [
      { id: 'name', msg: !state.name.fi.trim() || !state.name.sv.trim() || !state.name.en.trim() ? t('general.required-field') : '' },
      { id: 'primaryId', msg: !state.id.trim() ? t('general.required-field') : '' },
      { id: 'fairwayIds', msg: state.fairwayIds.length < 1 ? t('general.required-field') : '' },
    ];
    setValidationErrors(manualValidations);
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
    if (formRef.current?.checkValidity() && manualValidations.filter((error) => error.msg.length > 0).length < 1) {
      saveFairwayCard({ card: currentCard as FairwayCardInput });
    } else {
      setSaveError('MISSING-INFORMATION');
    }
  };

  return (
    <IonPage>
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
        {(isLoading || isLoadingMutation) && <IonProgressBar type="indeterminate" />}
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
              <IonButton shape="round" disabled={isError || isLoadingMutation} onClick={() => handleSubmit()}>
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
                      error={validationErrors.find((error) => error.id === 'fairwayIds')?.msg}
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
                  {!isLoadingPilotPlaces && (
                    <FormSelect
                      label={t('fairwaycard.linked-pilot-places')}
                      selected={(state.trafficService?.pilot?.places as PilotPlace[]) || []}
                      options={pilotPlaceList?.pilotPlaces || []}
                      setSelected={updateState}
                      actionType="pilotPlaces"
                      multiple
                      compareObjects
                    />
                  )}
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
            />

            <FormOptionalSection
              title={t('fairwaycard.tug-heading')}
              sections={state.trafficService?.tugs as TugInput[]}
              updateState={updateState}
              sectionType="tug"
            />
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardForm;

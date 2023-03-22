import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ActionTypeSelect, Lang, ValueType } from '../utils/constants';
import { ContentType, HarborInput, Operation, Status } from '../graphql/generated';
import { useFairwayCardsAndHarborsQueryData } from '../graphql/api';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextInputRow from './FormTextInputRow';

interface FormProps {
  harbour: HarborInput;
  isLoading?: boolean;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

const HarbourForm: React.FC<FormProps> = ({ harbour, isLoading, modified, modifier, isError }) => {
  const { t } = useTranslation();

  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();

  const [state, setState] = useState<HarborInput>(harbour);
  const modifiedInfo = modified ? t('general.datetimeFormat', { val: modified }) : '-';
  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (harbour.status !== Status.Draft) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

  const [validationErrors, setValidationErrors] = useState({ primaryId: '' });
  const reservedHarbourIds = fairwaysAndHarbours?.fairwayCardsAndHarbors
    .filter((item) => item.type === ContentType.Harbor)
    .flatMap((item) => item.id);

  const updateState = (value: ValueType, actionType: ActionType | ActionTypeSelect, actionLang?: Lang) => {
    console.log('updateState... for input ' + actionType);
    // Check manual validations
    if (actionType === 'primaryId' && state.operation === Operation.Create) {
      setValidationErrors({
        ...validationErrors,
        primaryId: reservedHarbourIds?.includes(value as string) ? t('harbour.error-duplicate-id') : '',
      });
    }

    let newState: HarborInput;
    switch (actionType) {
      case 'primaryId':
        newState = { ...state, id: value as string };
        break;
      case 'name':
        if (!actionLang) return state;
        newState = { ...state, name: { ...state.name, [actionLang as string]: value as string } };
        break;
      case 'extraInfo':
        if (!actionLang) return state;
        newState = {
          ...state,
          extraInfo: {
            ...(state.extraInfo || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'cargo':
        if (!actionLang) return state;
        newState = {
          ...state,
          cargo: {
            ...(state.cargo || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'harbourBasin':
        if (!actionLang) return state;
        newState = {
          ...state,
          harborBasin: {
            ...(state.harborBasin || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'companyName':
        if (!actionLang) return state;
        newState = {
          ...state,
          company: {
            ...(state.company || { fi: '', sv: '', en: '' }),
            [actionLang as string]: value as string,
          },
        };
        break;
      case 'email':
        newState = { ...state, email: value as string };
        break;
      case 'phoneNumber':
        newState = { ...state, phoneNumber: (value as string).split(',') };
        break;
      case 'fax':
        newState = { ...state, fax: value as string };
        break;
      case 'internet':
        newState = { ...state, internet: value as string };
        break;
      case 'lat':
        newState = { ...state, geometry: { lat: value as number, lon: state.geometry.lon } };
        break;
      case 'lon':
        newState = { ...state, geometry: { lat: state.geometry.lat, lon: value as number } };
        break;
      case 'status':
        newState = { ...state, status: value as Status };
        break;
      default:
        console.warn(`Unknown action type, state not updated.`);
        return state;
    }
    setState(newState);
  };

  useEffect(() => {
    setState(harbour);
  }, [harbour]);

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
            {!isLoading && (
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
            )}
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

      <IonContent className="mainContent ion-no-padding" data-testid="harbourEditPage">
        {isError && <p>{t('general.loading-error')}</p>}
        {isLoading && <IonProgressBar type="indeterminate" />}

        {!isLoading && !isError && (
          <form ref={formRef}>
            <IonGrid className="formGrid">
              <IonRow>
                <IonCol size="3">
                  <FormInput
                    label={t('harbour.primary-id')}
                    val={state.id}
                    setValue={updateState}
                    actionType="primaryId"
                    required
                    disabled={state.operation === Operation.Update}
                    error={validationErrors.primaryId}
                    helperText={t('harbour.primary-id-help-text')}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonText>
              <h2>{t('harbour.harbour-info')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <FormTextInputRow labelKey="harbour.name" value={state.name} updateState={updateState} actionType="name" required />
              <FormTextInputRow
                labelKey="harbour.extra-info"
                value={state.extraInfo}
                updateState={updateState}
                actionType="extraInfo"
                inputType="textarea"
              />
              <FormTextInputRow labelKey="harbour.cargo" value={state.cargo} updateState={updateState} actionType="cargo" inputType="textarea" />
              <FormTextInputRow
                labelKey="harbour.harbour-basin"
                value={state.harborBasin}
                updateState={updateState}
                actionType="harbourBasin"
                inputType="textarea"
              />
            </IonGrid>
            <IonText>
              <h3>{t('harbour.contact-info')}</h3>
            </IonText>
            <IonGrid className="formGrid">
              <FormTextInputRow labelKey="harbour.company-name" value={state.company} updateState={updateState} actionType="companyName" />
              <IonRow>
                <IonCol>
                  <FormInput label={t('harbour.email')} val={state.email || ''} setValue={updateState} actionType="email" />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('harbour.phone-number')}
                    val={state.phoneNumber?.join(',') || ''}
                    setValue={updateState}
                    actionType="phoneNumber"
                  />
                </IonCol>
                <IonCol>
                  <FormInput label={t('harbour.fax')} val={state.fax || ''} setValue={updateState} actionType="fax" />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormInput label={t('harbour.internet')} val={state.internet || ''} setValue={updateState} actionType="internet" />
                </IonCol>
                <IonCol>
                  <FormInput label={t('harbour.lat')} val={state.geometry.lat || ''} setValue={updateState} actionType="lat" />
                </IonCol>
                <IonCol>
                  <FormInput label={t('harbour.lon')} val={state.geometry.lon || ''} setValue={updateState} actionType="lon" />
                </IonCol>
              </IonRow>
            </IonGrid>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default HarbourForm;

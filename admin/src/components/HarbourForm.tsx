import React, { useCallback, useRef, useState } from 'react';
import { IonAlert, IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
import { ContentType, Harbor, HarborInput, Operation, QuayInput, Status } from '../graphql/generated';
import { useFairwayCardsAndHarborsQueryData, useSaveHarborMutationQuery } from '../graphql/api';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextInputRow from './FormTextInputRow';
import { harbourReducer } from '../utils/harbourReducer';
import FormOptionalSection from './FormOptionalSection';
import ConfirmationModal, { StatusName } from './ConfirmationModal';

interface FormProps {
  harbour: HarborInput;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

const HarbourForm: React.FC<FormProps> = ({ harbour, modified, modifier, isError }) => {
  const { t } = useTranslation();

  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();

  const [state, setState] = useState<HarborInput>(harbour);
  const modifiedInfo = modified ? t('general.datetimeFormat', { val: modified }) : '-';
  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (harbour.status !== Status.Draft) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

  const [validationErrors, setValidationErrors] = useState<ValidationType[]>([]);
  const reservedHarbourIds = fairwaysAndHarbours?.fairwayCardsAndHarbors
    .filter((item) => item.type === ContentType.Harbor)
    .flatMap((item) => item.id);

  const updateState = (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => {
    setState(
      harbourReducer(state, value, actionType, validationErrors, setValidationErrors, actionLang, actionTarget, actionOuterTarget, reservedHarbourIds)
    );
  };

  // Save harbour
  const [saveError, setSaveError] = useState<string>();
  const [savedHarbour, setSavedHarbour] = useState<Harbor | null>();
  const { mutate: saveHarbourMutation, isLoading: isLoadingMutation } = useSaveHarborMutationQuery({
    onSuccess(data) {
      setSavedHarbour(data.saveHarbor);
    },
    onError: (error: Error) => {
      setSaveError(error.message);
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const saveHarbour = useCallback(() => {
    const currentHarbour = {
      ...state,
      quays: state.quays?.map((quay) => {
        return {
          ...quay,
          geometry:
            !quay?.geometry?.lat || !quay?.geometry?.lon
              ? undefined
              : {
                  lat: quay?.geometry?.lat,
                  lon: quay?.geometry?.lon,
                },
          length: quay?.length || undefined,
          sections: quay?.sections?.map((quaySection) => {
            return {
              ...quaySection,
              geometry:
                !quaySection?.geometry?.lat || !quaySection?.geometry?.lon
                  ? undefined
                  : { lat: quaySection?.geometry?.lat, lon: quaySection?.geometry?.lon },
              depth: quaySection?.depth || undefined,
            };
          }),
        };
      }),
    };
    console.log(currentHarbour);
    saveHarbourMutation({ harbor: currentHarbour as HarborInput });
  }, [state, saveHarbourMutation]);

  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (isRemove = false) => {
    // Manual validations for required fields
    let primaryIdErrorMsg = '';
    if (reservedHarbourIds?.includes(state.id.trim())) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
    if (state.id.trim().length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    const manualValidations = [
      { id: 'name', msg: !state.name.fi.trim() || !state.name.sv.trim() || !state.name.en.trim() ? t(ErrorMessageKeys?.required) : '' },
      { id: 'primaryId', msg: primaryIdErrorMsg },
      { id: 'lat', msg: !state.geometry.lat ? t(ErrorMessageKeys?.required) : '' },
      { id: 'lon', msg: !state.geometry.lon ? t(ErrorMessageKeys?.required) : '' },
    ];
    setValidationErrors(manualValidations);

    if (formRef.current?.checkValidity() && manualValidations.filter((error) => error.msg.length > 0).length < 1) {
      if (state.operation === Operation.Create || (state.status === Status.Draft && harbour.status === Status.Draft && !isRemove)) {
        saveHarbour();
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
        saveType="harbor"
        action={saveHarbour}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        newStatus={state.status}
        oldState={savedHarbour ? (savedHarbour as StatusName) : harbour}
      />
      <IonAlert
        isOpen={!!saveError || !!savedHarbour}
        onDidDismiss={() => {
          setSaveError('');
          setSavedHarbour(null);
        }}
        header={(saveError ? t('general.save-failed') : t('general.save-successful')) || ''}
        subHeader={(saveError ? t('general.error-' + saveError) : t('general.saved-by-id', { id: savedHarbour?.id })) || ''}
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
              <IonButton shape="round" disabled={isError || isLoadingMutation} onClick={() => handleSubmit()}>
                {state.operation === Operation.Update ? t('general.save') : t('general.create-new')}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonHeader>

      <IonContent className="mainContent ion-no-padding" data-testid="harbourEditPage">
        {isError && <p>{t('general.loading-error')}</p>}

        {!isError && (
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
                    error={validationErrors.find((error) => error.id === 'primaryId')?.msg}
                    helperText={t('harbour.primary-id-help-text')}
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
                <IonCol size="6" className="no-border"></IonCol>
              </IonRow>
            </IonGrid>
            <IonText>
              <h2>{t('harbour.harbour-info')}</h2>
            </IonText>
            <IonGrid className="formGrid">
              <FormTextInputRow
                labelKey="harbour.name"
                value={state.name}
                updateState={updateState}
                actionType="name"
                required
                error={validationErrors.find((error) => error.id === 'name')?.msg}
              />
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
                  <FormInput label={t('general.email')} val={state.email || ''} setValue={updateState} actionType="email" inputType="email" />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('general.phone-number')}
                    val={state.phoneNumber?.join(',')}
                    setValue={updateState}
                    actionType="phoneNumber"
                    helperText={t('general.use-comma-separated-values')}
                    inputType="tel"
                    multiple
                  />
                </IonCol>
                <IonCol>
                  <FormInput label={t('general.fax')} val={state.fax || ''} setValue={updateState} actionType="fax" inputType="tel" />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormInput label={t('harbour.internet')} val={state.internet || ''} setValue={updateState} actionType="internet" />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('harbour.lat')}
                    val={state.geometry.lat || ''}
                    setValue={updateState}
                    actionType="lat"
                    required
                    error={validationErrors.find((error) => error.id === 'lat')?.msg}
                    inputType="latitude"
                  />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('harbour.lon')}
                    val={state.geometry.lon || ''}
                    setValue={updateState}
                    actionType="lon"
                    required
                    error={validationErrors.find((error) => error.id === 'lon')?.msg}
                    inputType="longitude"
                  />
                </IonCol>
              </IonRow>
            </IonGrid>

            <FormOptionalSection
              title={t('harbour.quay-heading')}
              sections={state.quays as QuayInput[]}
              updateState={updateState}
              sectionType="quay"
              validationErrors={validationErrors}
            />
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default HarbourForm;

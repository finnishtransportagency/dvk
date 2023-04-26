import React, { useCallback, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonProgressBar, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ConfirmationType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
import { ContentType, Harbor, HarborInput, Operation, QuayInput, Status } from '../graphql/generated';
import { useFairwayCardsAndHarborsQueryData, useFairwayCardsQueryData, useSaveHarborMutationQuery } from '../graphql/api';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextInputRow from './FormTextInputRow';
import { harbourReducer } from '../utils/harbourReducer';
import FormOptionalSection from './FormOptionalSection';
import ConfirmationModal, { StatusName } from './ConfirmationModal';
import { useHistory } from 'react-router';
import { diff } from 'deep-object-diff';
import { useQueryClient } from '@tanstack/react-query';
import NotificationModal from './NofiticationModal';

interface FormProps {
  harbour: HarborInput;
  modified?: number;
  modifier?: string;
  isError?: boolean;
}

const HarbourForm: React.FC<FormProps> = ({ harbour, modified, modifier, isError }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();
  const { data: fairwayCardList } = useFairwayCardsQueryData();
  const queryClient = useQueryClient();

  const [state, setState] = useState<HarborInput>(harbour);
  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (state.operation === Operation.Update) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

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

  // Confirmation modal
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('');

  const history = useHistory();
  const backToList = () => {
    history.push({ pathname: '/' });
  };

  const handleCancel = () => {
    const diffObj = diff(harbour, state);
    if (JSON.stringify(diffObj) === '{}') {
      backToList();
    } else {
      setConfirmationType('cancel');
    }
  };

  // Save harbour
  const [saveError, setSaveError] = useState<string>();
  const [saveErrorMsg, setSaveErrorMsg] = useState<string>();
  const [saveErrorItems, setSaveErrorItems] = useState<string[]>();
  const [savedHarbour, setSavedHarbour] = useState<Harbor | null>();
  const { mutate: saveHarbourMutation, isLoading: isLoadingMutation } = useSaveHarborMutationQuery({
    onSuccess(data) {
      setSavedHarbour(data.saveHarbor);
    },
    onError: (error: Error) => {
      setSaveError(error.message);
    },
  });

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
    // Check if harbour is linked to some fairway card
    queryClient.invalidateQueries({ queryKey: ['fairwayCards'] });
    const linkedFairwayCards = fairwayCardList?.fairwayCards.filter(
      (card) => card.harbors?.filter((harbourItem) => harbourItem.id === harbour.id).length
    );
    const isToBeRemoved = isRemove || (harbour.status !== Status.Removed && state.status === Status.Removed);
    const isToBeDrafted = harbour.status === Status.Public && state.status === Status.Draft;
    if ((linkedFairwayCards || []).length > 0) {
      if (isToBeRemoved || isToBeDrafted) {
        let translatedMsg = t('harbour.linked-fairwaycards-exist-cannot-remove-harbour', { count: linkedFairwayCards?.length });
        if (isToBeDrafted) translatedMsg = t('harbour.linked-fairwaycards-exist-cannot-draft-harbour', { count: linkedFairwayCards?.length });
        setSaveError('OPERATION-BLOCKED');
        setSaveErrorMsg(translatedMsg);
        setSaveErrorItems(linkedFairwayCards?.map((card) => card.name[lang] || card.name.fi || card.id));
        return;
      }
    }
    if (isRemove) updateState(Status.Removed, 'status');

    // Manual validations for required fields
    let primaryIdErrorMsg = '';
    if (state.operation === Operation.Create) {
      if (reservedHarbourIds?.includes(state.id.trim())) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId) || '';
      if (state.id.trim().length < 1) primaryIdErrorMsg = t(ErrorMessageKeys?.required) || '';
    }
    const manualValidations = [
      { id: 'name', msg: !state.name.fi.trim() || !state.name.sv.trim() || !state.name.en.trim() ? t(ErrorMessageKeys?.required) : '' },
      { id: 'primaryId', msg: primaryIdErrorMsg },
      { id: 'lat', msg: !state.geometry.lat ? t(ErrorMessageKeys?.required) : '' },
      { id: 'lon', msg: !state.geometry.lon ? t(ErrorMessageKeys?.required) : '' },
    ];
    setValidationErrors(manualValidations);

    if (formRef.current?.checkValidity() && manualValidations.filter((error) => error.msg.length > 0).length < 1) {
      if (
        (state.operation === Operation.Create && state.status === Status.Draft) ||
        (state.status === Status.Draft && harbour.status === Status.Draft && !isRemove)
      ) {
        saveHarbour();
      } else {
        setConfirmationType('save');
      }
    } else {
      setSaveError('MISSING-INFORMATION');
    }
  };

  const getModifiedInfo = () => {
    if (savedHarbour) return t('general.datetimeFormat', { val: savedHarbour.modificationTimestamp || savedHarbour.creationTimestamp });
    return modified ? t('general.datetimeFormat', { val: modified }) : '-';
  };

  const closeNotification = () => {
    setSaveError('');
    setSaveErrorMsg('');
    setSaveErrorItems([]);
    if (!saveError && !!savedHarbour) {
      if (state.operation === Operation.Update) history.go(0);
      if (state.operation === Operation.Create) history.push({ pathname: '/satama/' + savedHarbour.id });
    }
  };

  const getNotificationTitle = () => {
    if (saveError === 'OPERATION-BLOCKED') return '';
    return (saveError ? t('general.save-failed') : t('general.save-successful')) || '';
  };

  return (
    <IonPage>
      <ConfirmationModal
        saveType="harbor"
        action={confirmationType === 'cancel' ? backToList : saveHarbour}
        confirmationType={confirmationType}
        setConfirmationType={setConfirmationType}
        newStatus={state.status}
        oldState={savedHarbour ? (savedHarbour as StatusName) : harbour}
      />
      <NotificationModal
        isOpen={!!saveError || !!savedHarbour}
        closeAction={closeNotification}
        header={getNotificationTitle()}
        subHeader={
          (saveError
            ? t('general.error-' + saveError)
            : t('modal.saved-harbor-by-name', { name: savedHarbour?.name ? savedHarbour?.name[lang] || savedHarbour.name.fi : savedHarbour?.id })) ||
          ''
        }
        message={saveError ? saveErrorMsg || t('general.fix-errors-try-again') || '' : ''}
        itemList={saveErrorItems}
      />
      <IonHeader className="ion-no-border">
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
                        {savedHarbour?.modifier || savedHarbour?.creator || modifier || t('general.unknown')}
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
                disabled={isLoadingMutation}
              />
            </IonCol>
            <IonCol size="auto">
              <IonButton shape="round" className="invert" onClick={() => handleCancel()} disabled={isLoadingMutation}>
                {t('general.cancel')}
              </IonButton>
              {state.operation === Operation.Update && harbour.status !== Status.Removed && (
                <IonButton
                  shape="round"
                  color="danger"
                  disabled={isError || isLoadingMutation}
                  onClick={() => {
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
                    error={state.operation === Operation.Update ? '' : validationErrors.find((error) => error.id === 'primaryId')?.msg}
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
                    disabled={harbour.status === Status.Removed}
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
                disabled={harbour.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'name')?.msg}
              />
              <FormTextInputRow
                labelKey="harbour.extra-info"
                value={state.extraInfo}
                updateState={updateState}
                actionType="extraInfo"
                required={!!(state.extraInfo?.fi || state.extraInfo?.sv || state.extraInfo?.en)}
                disabled={harbour.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="harbour.cargo"
                value={state.cargo}
                updateState={updateState}
                actionType="cargo"
                required={!!(state.cargo?.fi || state.cargo?.sv || state.cargo?.en)}
                disabled={harbour.status === Status.Removed}
                inputType="textarea"
              />
              <FormTextInputRow
                labelKey="harbour.harbour-basin"
                value={state.harborBasin}
                updateState={updateState}
                actionType="harbourBasin"
                required={!!(state.harborBasin?.fi || state.harborBasin?.sv || state.harborBasin?.en)}
                disabled={harbour.status === Status.Removed}
                inputType="textarea"
              />
            </IonGrid>
            <IonText>
              <h3>{t('harbour.contact-info')}</h3>
            </IonText>
            <IonGrid className="formGrid">
              <FormTextInputRow
                labelKey="harbour.company-name"
                value={state.company}
                updateState={updateState}
                actionType="companyName"
                required={!!(state.company?.fi || state.company?.sv || state.company?.en)}
                disabled={harbour.status === Status.Removed}
              />
              <IonRow>
                <IonCol>
                  <FormInput
                    label={t('general.email')}
                    val={state.email || ''}
                    setValue={updateState}
                    actionType="email"
                    inputType="email"
                    disabled={harbour.status === Status.Removed}
                  />
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
                    disabled={harbour.status === Status.Removed}
                  />
                </IonCol>
                <IonCol>
                  <FormInput
                    label={t('general.fax')}
                    val={state.fax || ''}
                    setValue={updateState}
                    actionType="fax"
                    inputType="tel"
                    disabled={harbour.status === Status.Removed}
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FormInput
                    label={t('harbour.internet')}
                    val={state.internet || ''}
                    setValue={updateState}
                    actionType="internet"
                    disabled={harbour.status === Status.Removed}
                  />
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
                    disabled={harbour.status === Status.Removed}
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
                    disabled={harbour.status === Status.Removed}
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
              disabled={harbour.status === Status.Removed}
            />
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default HarbourForm;

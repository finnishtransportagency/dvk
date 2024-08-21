import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ConfirmationType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
import { ContentType, HarborByIdFragment, HarborInput, Operation, QuayInput, Status } from '../graphql/generated';
import { useFairwayCardsAndHarborsQueryData, useFairwayCardsQueryData, useSaveHarborMutationQuery } from '../graphql/api';
import { harbourReducer } from '../utils/harbourReducer';
import Section from './form/Section';
import ConfirmationModal, { StatusName } from './ConfirmationModal';
import { useHistory } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import NotificationModal from './NotificationModal';
import { mapToHarborInput } from '../utils/dataMapper';
import { hasUnsavedChanges, validateHarbourForm } from '../utils/formValidations';
import HarbourSection from './form/harbour/HarbourSection';
import ContactInfoSection from './form/harbour/ContactInfoSection';
import MainSection from './form/harbour/MainSection';
import Header from './form/Header';
import { openPreview } from '../utils/common';
import StatusBar from './StatusBar';

interface FormProps {
  harbour: HarborInput;
  modified?: number;
  modifier?: string;
  creator?: string;
  created?: number;
  isError?: boolean;
}

const HarbourForm: React.FC<FormProps> = ({ harbour, modified, modifier, creator, created, isError }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const history = useHistory();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, setState] = useState<HarborInput>(harbour);
  const [oldState, setOldState] = useState<HarborInput>(harbour);
  const [validationErrors, setValidationErrors] = useState<ValidationType[]>([]);
  const [saveError, setSaveError] = useState<string>();
  const [saveErrorMsg, setSaveErrorMsg] = useState<string>();
  const [saveErrorItems, setSaveErrorItems] = useState<string[]>();
  const [savedHarbour, setSavedHarbour] = useState<HarborByIdFragment | null>();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>(''); // Confirmation modal
  const [previewConfirmation, setPreviewConfirmation] = useState<ConfirmationType>(''); // Preview confirmation modal
  const [previewPending, setPreviewPending] = useState(false);

  const queryClient = useQueryClient();
  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData();
  const { data: fairwayCardList } = useFairwayCardsQueryData();
  const { mutate: saveHarbourMutation, isPending: isLoadingMutation } = useSaveHarborMutationQuery({
    onSuccess(data) {
      setSavedHarbour(data.saveHarbor);
      setOldState(mapToHarborInput(false, { harbor: data.saveHarbor }));
      setNotificationOpen(true);
      if (previewPending) {
        handleOpenPreview();
      }
    },
    onError: (error: Error) => {
      setSaveError(error.message);
      setNotificationOpen(true);
    },
  });

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

  const backToList = () => {
    history.push({ pathname: '/' });
  };

  const handleCancel = () => {
    if (hasUnsavedChanges(oldState, state)) {
      setConfirmationType('cancel');
    } else {
      backToList();
    }
  };

  const saveHarbour = useCallback(
    (isRemove?: boolean) => {
      if (isRemove) {
        const oldHarbour = { ...oldState, status: Status.Removed };
        setState({ ...oldState, status: Status.Removed });
        saveHarbourMutation({ harbor: oldHarbour as HarborInput });
      } else {
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
              length: quay?.length ?? undefined,
              sections: quay?.sections?.map((quaySection) => {
                return {
                  ...quaySection,
                  geometry:
                    !quaySection?.geometry?.lat || !quaySection?.geometry?.lon
                      ? undefined
                      : { lat: quaySection?.geometry?.lat, lon: quaySection?.geometry?.lon },
                  depth: quaySection?.depth ?? undefined,
                };
              }),
            };
          }),
        };
        saveHarbourMutation({ harbor: currentHarbour as HarborInput });
      }
    },
    [state, oldState, saveHarbourMutation]
  );

  const formValid = (): boolean => {
    let primaryIdErrorMsg = '';
    const requiredMsg = t(ErrorMessageKeys?.required) ?? '';
    if (state.operation === Operation.Create) {
      if (reservedHarbourIds?.includes(state.id.trim())) primaryIdErrorMsg = t(ErrorMessageKeys?.duplicateId);
      if (state.id.trim().length < 1) primaryIdErrorMsg = requiredMsg;
    }
    const validations: ValidationType[] = validateHarbourForm(state, requiredMsg, primaryIdErrorMsg);
    setValidationErrors(validations);
    return !!formRef.current?.checkValidity() && validations.filter((error) => error.msg.length > 0).length < 1;
  };

  const checkLinkedFairways = (isToBeRemoved: boolean, isToBeDrafted: boolean) => {
    const linkedFairwayCards = fairwayCardList?.fairwayCards.filter(
      (card) => card.harbors?.filter((harbourItem) => harbourItem.id === harbour.id).length
    );

    if ((linkedFairwayCards || []).length > 0) {
      if (isToBeRemoved || isToBeDrafted) {
        let translatedMsg = t('harbour.linked-fairwaycards-exist-cannot-remove-harbour', { count: linkedFairwayCards?.length });
        if (isToBeDrafted) translatedMsg = t('harbour.linked-fairwaycards-exist-cannot-draft-harbour', { count: linkedFairwayCards?.length });
        setSaveError('OPERATION-BLOCKED');
        setSaveErrorMsg(translatedMsg);
        setSaveErrorItems(linkedFairwayCards?.map((card) => card.name[lang] ?? card.name.fi ?? card.id));
        return true;
      }
    }
    return false;
  };

  const handleSubmit = (isRemove = false) => {
    queryClient.invalidateQueries({ queryKey: ['fairwayCards'] }).catch((err) => console.error(err));

    const isToBeRemoved = isRemove || (harbour.status !== Status.Removed && state.status === Status.Removed);
    const isToBeDrafted = harbour.status === Status.Public && state.status === Status.Draft;
    const linkedFairways = checkLinkedFairways(isToBeRemoved, isToBeDrafted);

    if (linkedFairways) {
      setPreviewPending(false);
      return;
    }

    if (isToBeRemoved) {
      setConfirmationType('remove');
    } else if (formValid()) {
      if (state.status === Status.Draft && (oldState.status === Status.Draft || state.operation === Operation.Create)) {
        saveHarbour(false);
      } else {
        setConfirmationType('save');
      }
    } else {
      setSaveError('MISSING-INFORMATION');
      setPreviewPending(false);
    }
  };

  const handleOpenPreview = () => {
    openPreview(harbour.id, false);
    setPreviewPending(false);
  };

  const handlePreview = () => {
    setPreviewPending(true);
    if (hasUnsavedChanges(oldState, state)) {
      setPreviewConfirmation('preview');
    } else {
      handleOpenPreview();
    }
  };

  const getDateTimeInfo = (isModifiedInfo: boolean) => {
    if (savedHarbour) {
      return t('general.datetimeFormat', {
        val: isModifiedInfo
          ? (savedHarbour.modificationTimestamp ?? savedHarbour.creationTimestamp)
          : (savedHarbour.creationTimestamp ?? savedHarbour.modificationTimestamp),
      });
    }
    if (isModifiedInfo) {
      return modified ? t('general.datetimeFormat', { val: modified }) : '-';
    } else {
      return created ? t('general.datetimeFormat', { val: created }) : '-';
    }
  };

  const closeNotification = () => {
    setSaveError('');
    setSaveErrorMsg('');
    setSaveErrorItems([]);
    setNotificationOpen(false);
    if (!saveError && !!savedHarbour) {
      if (state.operation === Operation.Create) history.push({ pathname: '/satama/' + savedHarbour.id });
    }
  };

  const getNotificationTitle = () => {
    if (saveError === 'OPERATION-BLOCKED') return '';
    return (saveError ? t('general.save-failed') : t('general.save-successful')) || '';
  };

  useEffect(() => {
    setState(harbour);
    setOldState(harbour);
  }, [harbour]);

  return (
    <IonPage>
      <ConfirmationModal
        saveType="harbor"
        action={confirmationType === 'cancel' ? backToList : saveHarbour}
        confirmationType={confirmationType}
        setConfirmationType={setConfirmationType}
        newStatus={state.status}
        oldState={savedHarbour ? (savedHarbour as StatusName) : harbour}
        setActionPending={setPreviewPending}
      />
      <ConfirmationModal
        saveType="harbor"
        action={handleSubmit}
        confirmationType={previewConfirmation}
        setConfirmationType={setPreviewConfirmation}
        newStatus={state.status}
        oldState={savedHarbour ? (savedHarbour as StatusName) : harbour}
        setActionPending={setPreviewPending}
      />
      <NotificationModal
        isOpen={!!saveError || notificationOpen}
        closeAction={closeNotification}
        closeTitle={t('general.button-ok')}
        header={getNotificationTitle()}
        subHeader={
          (saveError
            ? t('general.error-' + saveError)
            : t('modal.saved-harbor-by-name', {
                name: savedHarbour?.name ? (savedHarbour?.name[lang] ?? savedHarbour.name.fi) : savedHarbour?.id,
              })) ?? ''
        }
        message={saveError ? (saveErrorMsg ?? t('general.fix-errors-try-again') ?? '') : ''}
        itemList={saveErrorItems}
      />
      <Header
        operation={state.operation}
        status={state.status}
        oldStatus={oldState.status}
        isLoading={isLoadingMutation}
        isLoadingMutation={isLoadingMutation}
        updateState={updateState}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handlePreview={handlePreview}
        isError={isError}
      />

      <IonContent className="mainContent ion-no-padding" data-testid="harbourEditPage">
        {isError && <p>{t('general.loading-error')}</p>}

        {!isError && (
          <>
            <StatusBar
              status={state.status}
              modified={getDateTimeInfo(true)}
              modifier={savedHarbour?.modifier ?? savedHarbour?.creator ?? modifier ?? t('general.unknown')}
              creator={savedHarbour?.creator ?? creator}
              created={getDateTimeInfo(false)}
            />
            <form ref={formRef}>
              <MainSection state={state} updateState={updateState} validationErrors={validationErrors} />
              <HarbourSection state={state} updateState={updateState} validationErrors={validationErrors} />
              <ContactInfoSection state={state} updateState={updateState} validationErrors={validationErrors} />
              <Section
                title={t('harbour.quay-heading')}
                sections={state.quays as QuayInput[]}
                updateState={updateState}
                sectionType="quay"
                validationErrors={validationErrors}
                disabled={state.status === Status.Removed}
              />
            </form>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default HarbourForm;

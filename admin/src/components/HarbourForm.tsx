import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, ConfirmationType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../utils/constants';
import { ContentType, HarborByIdFragment, HarborInput, Operation, QuayInput, Status } from '../graphql/generated';
import {
  useHarbourLatestByIdQueryData,
  useFairwayCardsAndHarborsQueryData,
  useFairwayCardsQueryData,
  useSaveHarborMutationQuery,
} from '../graphql/api';
import { harbourReducer } from '../utils/harbourReducer';
import Section from './form/Section';
import ConfirmationModal, { StatusName } from './ConfirmationModal';
import { useHistory } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import NotificationModal from './NotificationModal';
import { mapNewHarbourVersion, mapToHarborInput } from '../utils/dataMapper';
import { hasUnsavedChanges, validateHarbourForm } from '../utils/formValidations';
import HarbourSection from './form/harbour/HarbourSection';
import ContactInfoSection from './form/harbour/ContactInfoSection';
import MainSection from './form/harbour/MainSection';
import Header from './form/Header';
import { openPreview } from '../utils/common';
import InfoHeader from './InfoHeader';

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
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false);

  const queryClient = useQueryClient();
  const { data: fairwaysAndHarbours } = useFairwayCardsAndHarborsQueryData(false);
  const { data: fairwayCardList } = useFairwayCardsQueryData();
  const { data: latestHarbor } = useHarbourLatestByIdQueryData(harbour.id);
  const { mutate: saveHarbourMutation, isPending: isLoadingMutation } = useSaveHarborMutationQuery({
    onSuccess(data) {
      setSavedHarbour(data.saveHarbor);
      setOldState(mapToHarborInput(false, { harbor: data.saveHarbor }));
      setNotificationOpen(true);
      if (previewPending) {
        handleOpenPreview();
      }
      if (isSubmittingVersion) {
        const latestVersionUsed = latestHarbor?.harbor?.latestVersionUsed;
        const latestVersionNumber = latestHarbor?.harbor?.latest;
        // if latestVersionUsed is null, check latest. If still null we can assume there's only one version

        const nextVersionNumber = (latestVersionUsed ?? latestVersionNumber ?? 1) + 1;

        history.push({ pathname: '/satama/' + data.saveHarbor?.id + '/v' + nextVersionNumber });
        setIsSubmittingVersion(false);
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

  const saveHarbour = useCallback(
    (operation: Operation) => {
      const mapQuays = (harbour: HarborInput) => {
        return {
          ...harbour,
          quays: harbour.quays?.map((quay) => {
            return {
              ...quay,
              geometry:
                !quay?.geometry?.lat || !quay?.geometry?.lon
                  ? ''
                  : {
                      lat: quay?.geometry?.lat,
                      lon: quay?.geometry?.lon,
                    },
              length: quay?.length ?? '',
              sections: quay?.sections?.map((quaySection) => {
                return {
                  ...quaySection,
                  geometry:
                    !quaySection?.geometry?.lat || !quaySection?.geometry?.lon
                      ? { lat: '', lon: '' }
                      : { lat: quaySection?.geometry?.lat, lon: quaySection?.geometry?.lon },
                  depth: quaySection?.depth ?? '',
                };
              }),
            };
          }),
        };
      };

      if (operation === Operation.Publish) {
        setState({ ...state, status: Status.Public });
        saveHarbourMutation({ harbor: mapQuays({ ...state, status: Status.Public, operation }) as HarborInput });
      } else if (operation === Operation.Archive) {
        setState({ ...state, status: Status.Archived });
        saveHarbourMutation({ harbor: mapQuays({ ...state, status: Status.Archived, operation }) as HarborInput });
      } else if (operation === Operation.Remove) {
        // Ignore unsaved changes if draft harbour is removed
        setState({ ...oldState, status: Status.Removed });
        saveHarbourMutation({ harbor: mapQuays({ ...oldState, status: Status.Removed, operation }) as HarborInput });
      } else if (operation === Operation.Update) {
        saveHarbourMutation({ harbor: mapQuays(state) as HarborInput });
      } else if (operation === Operation.Create) {
        saveHarbourMutation({ harbor: mapQuays({ ...state, version: 'v1' }) as HarborInput });
      } else if (operation === Operation.Createversion) {
        setIsSubmittingVersion(true);
        const newVersion = mapNewHarbourVersion(state);
        setState(newVersion);
        saveHarbourMutation({ harbor: mapQuays(newVersion) as HarborInput });
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
    const validations: ValidationType[] = validateHarbourForm(state, requiredMsg, primaryIdErrorMsg, t(ErrorMessageKeys?.duplicateLocation));
    setValidationErrors(validations);
    return !!formRef.current?.checkValidity() && validations.filter((error) => error.msg.length > 0).length < 1;
  };

  const checkLinkedFairwayCards = (operation: Operation) => {
    const linkedFairwayCards = fairwayCardList?.fairwayCards.filter(
      (card) => card.harbors?.filter((harbourItem) => harbourItem.id === harbour.id).length
    );

    if ((linkedFairwayCards || []).length > 0) {
      if (operation === Operation.Remove || operation === Operation.Archive) {
        const translatedMsg =
          operation === Operation.Remove
            ? t('harbour.linked-fairwaycards-exist-cannot-remove-harbour', { count: linkedFairwayCards?.length })
            : t('harbour.linked-fairwaycards-exist-cannot-archive-harbour', { count: linkedFairwayCards?.length });
        setSaveError('OPERATION-BLOCKED');
        setSaveErrorMsg(translatedMsg);
        setSaveErrorItems(linkedFairwayCards?.map((card) => card.name[lang] ?? card.name.fi ?? card.id));
        return true;
      }
    }
    return false;
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

  const handleSave = () => {
    if (formValid()) {
      saveHarbour(state.operation);
    } else {
      setSaveError('MISSING-INFORMATION');
      setPreviewPending(false);
    }
  };

  const handleRemove = () => {
    queryClient.invalidateQueries({ queryKey: ['fairwayCards'] }).catch((err) => console.error(err));
    const operation = state.status === Status.Public ? Operation.Archive : Operation.Remove;
    const linkedFairwayCards = checkLinkedFairwayCards(operation);

    // Cannot remove or archive harbour, if fairway card has a link to it
    if (linkedFairwayCards) {
      return;
    }

    if (state.status === Status.Draft) {
      setConfirmationType('remove');
    } else if (state.status === Status.Public) {
      setConfirmationType('archive');
    }
  };

  const handleOpenPreview = () => {
    openPreview(harbour.id, harbour.version, false);
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

  const handleNewVersion = () => {
    if (formValid()) {
      setConfirmationType('version');
    } else if (!saveError && !saveErrorMsg) {
      setSaveError('OPERATION-BLOCKED');
      setSaveErrorMsg(t('general.fix-errors-try-again'));
    }
  };

  const handlePublish = () => {
    if (formValid()) {
      setConfirmationType('publish');
    } else {
      setSaveError('MISSING-INFORMATION');
    }
  };

  const handleConfirmationSubmit = () => {
    switch (confirmationType) {
      case 'archive':
        return saveHarbour(Operation.Archive);
      case 'cancel':
        return backToList();
      case 'publish':
        return saveHarbour(Operation.Publish);
      case 'remove':
        return saveHarbour(Operation.Remove);
      case 'version':
        return saveHarbour(Operation.Createversion);
      default:
        return;
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
    if (!saveError && !!savedHarbour && state.operation === Operation.Create) {
      if (state.operation === Operation.Create) history.push({ pathname: '/satama/' + savedHarbour.id + '/' + savedHarbour.version });
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
        action={handleConfirmationSubmit}
        confirmationType={confirmationType}
        setConfirmationType={setConfirmationType}
        newStatus={state.status}
        oldState={savedHarbour ? (savedHarbour as StatusName) : harbour}
        setActionPending={setPreviewPending}
      />
      <ConfirmationModal
        saveType="harbor"
        action={() => saveHarbour(state.operation)}
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
        currentState={state}
        oldState={oldState}
        isLoading={isLoadingMutation}
        isLoadingMutation={isLoadingMutation}
        handleCancel={handleCancel}
        handleSave={handleSave}
        handleRemove={handleRemove}
        handlePreview={handlePreview}
        handleNewVersion={handleNewVersion}
        handlePublish={handlePublish}
        isError={isError}
      />

      <IonContent className="mainContent ion-no-padding" data-testid="harbourEditPage">
        {isError && <p>{t('general.loading-error')}</p>}

        {!isError && (
          <>
            <InfoHeader
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

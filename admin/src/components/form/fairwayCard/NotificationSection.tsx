import React, { useEffect, useState } from 'react';
import { FairwayCardInput, Status, TemporaryNotificationInput } from '../../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';
import { IonButton, IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import TextInputRow from '../TextInputRow';
import HelpIcon from '../../../theme/img/help_icon.svg?react';
import NotificationModal from '../../NotificationModal';

interface NotificationSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  sectionType: 'temporaryNotifications';
  validationErrors: ValidationType[];
  sections?: TemporaryNotificationInput[];
  actionOuterTarget?: string | number;
  disabled?: boolean;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  state,
  updateState,
  sectionType,
  validationErrors,
  sections,
  actionOuterTarget,
  disabled,
}) => {
  const { t } = useTranslation();
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const [openSections, setOpenSections] = useState<boolean[]>(new Array(sections?.length).fill(true));
  const [focused, setFocused] = useState<boolean>(false);
  console.log(focused);

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  const addSection = () => {
    if (actionOuterTarget === undefined) {
      updateState(true, sectionType);
    } else {
      updateState(true, sectionType, undefined, undefined, actionOuterTarget);
    }
    setOpenSections(openSections.concat(true));
    // Trigger setting focus on last section's first input
    setFocused(true);
    setTimeout(() => {
      setFocused(false);
    }, 150);
  };

  /*const deleteSection = (idx: number) => {
    updateState(false, sectionType, undefined, idx, actionOuterTarget);
    setOpenSections(openSections.filter((s, i) => idx !== i));
  };*/
  useEffect(() => {
    if (openSections.length !== sections?.length) {
      setOpenSections(new Array(sections?.length).fill(true));
    }
  }, [sections, openSections.length]);

  return (
    <>
      <IonText>
        <h2>
          {t('fairwaycard.temporary-notification-title')}
          <IonButton
            fill="clear"
            className="icon-only xx-small labelButton"
            onClick={() => showInfoModal()}
            title={t('info') ?? ''}
            aria-label={t('info') ?? ''}
          >
            <HelpIcon />
          </IonButton>
        </h2>
      </IonText>
      {sections?.map((section, idx) => {
        return (
          <>
            <IonGrid className="formGrid">
              <TextInputRow
                labelKey="fairwaycard.temporary-notification"
                value={section.content}
                updateState={updateState}
                actionType="temporaryNotificationContent"
                actionTarget={idx}
                required={!!section.content?.fi || !!section.content?.sv || !!section.content?.en}
                disabled={state.status === Status.Removed}
                error={validationErrors.find((error) => error.id === 'temporaryNotifications')?.msg}
                inputType="textarea"
              />
            </IonGrid>
            <NotificationModal
              isOpen={infoModalOpen}
              closeAction={() => setInfoModalOpen(false)}
              closeTitle={t('general.close')}
              header={''}
              message={''}
            />
          </>
        );
      })}

      <IonGrid>
        <IonRow className="ion-justify-content-end">
          <IonCol size="auto">
            <IonButton shape="round" onClick={() => addSection()} disabled={disabled}>
              {t('general.add-section-temporary-notification')}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default NotificationSection;

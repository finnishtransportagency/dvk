import React, { useEffect, useState } from 'react';
import { FairwayCardInput, TemporaryNotificationInput } from '../../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';
import { IonButton, IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HelpIcon from '../../../theme/img/help_icon.svg?react';
import NotificationModal from '../../NotificationModal';
import NotificationInput from '../NotificationInput';
import SectionHeader from '../SectionHeader';

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

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  const toggleSection = (position: number) => {
    const opened = openSections.map((s, idx) => (idx === position ? !s : s));
    setOpenSections(opened);
  };

  const addSection = () => {
    if (actionOuterTarget === undefined) {
      updateState(true, sectionType);
    } else {
      updateState(true, sectionType, undefined, undefined, actionOuterTarget);
    }
    setOpenSections(openSections.concat(true));
  };

  const deleteSection = (idx: number) => {
    updateState(false, sectionType, undefined, idx, actionOuterTarget);
    setOpenSections(openSections.filter((_, i) => idx !== i));
  };

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
        const sectionOpen = !!openSections[idx];
        const sectionClassName = 'sectionContent' + (sectionOpen ? ' open' : ' closed');
        return (
          <div key={'notification' + idx}>
            <SectionHeader
              title={t('fairwaycard.temporary-notification')}
              idx={idx}
              deleteSection={deleteSection}
              toggleSection={toggleSection}
              open={sectionOpen}
            />
            <div className={sectionClassName} key={'notification' + idx}>
              <NotificationInput idx={idx} section={section} updateState={updateState} state={state} validationErrors={validationErrors} />
            </div>
          </div>
        );
      })}

      <NotificationModal
        isOpen={infoModalOpen}
        closeAction={() => setInfoModalOpen(false)}
        closeTitle={t('general.close')}
        header={t('fairwaycard.temporary-notification-title')}
        useTransElement={true}
        i18nkey="modal.temporary-notification-add"
      />
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

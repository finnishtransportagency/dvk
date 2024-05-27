import React, { useState } from 'react';
import { FairwayCardInput, Status } from '../../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';
import { IonButton, IonGrid, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import TextInputRow from '../TextInputRow';
import HelpIcon from '../../../theme/img/help_icon.svg?react';
import NotificationModal from '../../NotificationModal';
import MarkdownInputRow from '../MarkdownInputRow';

interface AdditionalInfoSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ state, updateState, validationErrors }) => {
  const { t } = useTranslation();
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  return (
    <>
      <IonText>
        <h2>
          {t('fairwaycard.fairway-additional-info')}
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
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="fairwaycard.fairway-additional-info"
          value={state.additionalInfo}
          updateState={updateState}
          actionType="additionalInfo"
          required={!!state.additionalInfo?.fi || !!state.additionalInfo?.sv || !!state.additionalInfo?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'additionalInfo')?.msg}
          inputType="textarea"
        />
        <MarkdownInputRow
          labelKey="fairwaycard.fairway-additional-info"
          value={state.additionalInfo}
          updateState={updateState}
          actionType="additionalInfo"
          required={!!state.additionalInfo?.fi || !!state.additionalInfo?.sv || !!state.additionalInfo?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'additionalInfo')?.msg}
        />
      </IonGrid>
      <NotificationModal
        isOpen={infoModalOpen}
        closeAction={() => setInfoModalOpen(false)}
        closeTitle={t('general.close')}
        header={t('fairwaycard.fairway-additional-info-notification-header') ?? ''}
        message={t('fairwaycard.fairway-additional-info-notification-body') ?? ''}
      />
    </>
  );
};

export default AdditionalInfoSection;

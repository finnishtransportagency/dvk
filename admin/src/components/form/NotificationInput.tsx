import React from 'react';
import { FairwayCardInput, Status, TemporaryNotificationInput } from '../../graphql/generated';
import { ActionType, Lang, ValidationType, ValueType } from '../../utils/constants';
import { IonGrid } from '@ionic/react';
import TextInputRow from './TextInputRow';
import CalendarInput from './CalendarInput';
import { useTranslation } from 'react-i18next';

interface NotificationInputProps {
  idx: number;
  section: TemporaryNotificationInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  state: FairwayCardInput;
  validationErrors: ValidationType[];
}

const NotificationInput: React.FC<NotificationInputProps> = ({ idx, section, updateState, state, validationErrors }) => {
  const { t } = useTranslation();

  return (
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
      <CalendarInput idx={idx} label={t('fairwaycard.temporary-notification-start')} setValue={updateState} />
    </IonGrid>
  );
};

export default NotificationInput;

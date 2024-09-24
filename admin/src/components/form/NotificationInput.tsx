import React from 'react';
import { FairwayCardInput, Status, TemporaryNotificationInput } from '../../graphql/generated';
import { ActionType, Lang, ValidationType, ValueType } from '../../utils/constants';
import { IonGrid } from '@ionic/react';
import CalendarInputRow from './CalendarInputRow';
import MarkdownInputRow from './MarkdownInputRow';

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
  return (
    <IonGrid className="formGrid">
      <MarkdownInputRow
        labelKey="fairwaycard.temporary-notification"
        value={section.content}
        updateState={updateState}
        actionType="temporaryNotificationContent"
        actionTarget={idx}
        required={!!section.content?.fi || !!section.content?.sv || !!section.content?.en}
        disabled={state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'temporaryNotifications')?.msg}
      />
      <CalendarInputRow
        idx={idx}
        section={section}
        setValue={updateState}
        validationErrors={validationErrors}
        disabled={state.status === Status.Removed || section.content?.fi == '' || section.content?.sv == '' || section.content?.en == ''}
      />
    </IonGrid>
  );
};

export default NotificationInput;

import { IonCol, IonRow } from '@ionic/react';
import React from 'react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { TemporaryNotificationInput } from '../../graphql/generated';
import CalendarInput from './CalendarInput';
import { useTranslation } from 'react-i18next';

interface CalendarInputRowProps {
  idx: number;
  section: TemporaryNotificationInput;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  validationErrors: ValidationType[];
  disabled?: boolean;
  readonly?: boolean;
}

const CalendarInputRow: React.FC<CalendarInputRowProps> = ({ idx, section, setValue, validationErrors, disabled, readonly = false }) => {
  const { t } = useTranslation();

  return (
    <IonRow className="bordered">
      <IonCol sizeMd="4">
        <CalendarInput
          id={'startDate' + idx}
          label={t('fairwaycard.temporary-notification-start')}
          value={section.startDate}
          setValue={setValue}
          actionTarget={idx}
          helperText={t('general.date-helper-text')}
          actionType="temporaryNotificationStartDate"
          error={validationErrors.find((error) => error.id === 'temporaryNotificationStartDate-' + idx)?.msg}
          readonly={readonly}
          disabled={!readonly && disabled}
          required={true}
        />
      </IonCol>
      <IonCol size="3.9">
        <CalendarInput
          id={'endDate' + idx}
          label={t('fairwaycard.temporary-notification-end')}
          value={section.endDate}
          setValue={setValue}
          actionTarget={idx}
          helperText={t('general.date-helper-text')}
          actionType="temporaryNotificationEndDate"
          error={validationErrors.find((error) => error.id === 'temporaryNotificationEndDate-' + idx)?.msg}
          readonly={readonly}
          disabled={!readonly && disabled}
        />
      </IonCol>
    </IonRow>
  );
};

export default CalendarInputRow;

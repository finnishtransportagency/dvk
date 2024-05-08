import { IonDatetime, IonModal } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang } from '../../utils/constants';
import TextInput from './TextInput';
import { checkIfValidAndChangeFormatToLocal } from '../../utils/common';

interface CalendarInputProps {
  id: string;
  value: string | undefined | null;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  actionTarget: number;
  actionType: ActionType;
  label: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const CalendarInput: React.FC<CalendarInputProps> = ({
  id,
  value,
  setValue,
  actionTarget,
  actionType,
  label,
  helperText,
  error,
  disabled,
  required,
}) => {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);

  const dateRef = useRef<null | HTMLIonDatetimeElement>(null);

  const handleChange = (newValue: string | null | undefined) => {
    setValue(newValue as string, actionType, undefined, actionTarget);
  };

  return (
    <>
      <IonModal className="datetimeModal" keepContentsMounted={true} isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
        <IonDatetime
          ref={dateRef}
          value={value}
          id={id}
          defaultValue={new Date().toISOString()}
          showDefaultButtons={true}
          multiple={false}
          presentation="date"
          locale="fi"
          onIonChange={(event) => handleChange(String(event.detail?.value))}
        >
          <span slot="title">{t('fairwaycard.temporary-notification-start')}</span>
        </IonDatetime>
      </IonModal>

      <TextInput
        label={label}
        val={checkIfValidAndChangeFormatToLocal(value)}
        setValue={setValue}
        actionType={actionType}
        actionTarget={actionTarget}
        setModalOpen={setModalOpen}
        helperText={helperText}
        error={error}
        disabled={disabled}
        required={required}
        inputType="date"
      />
    </>
  );
};

export default CalendarInput;

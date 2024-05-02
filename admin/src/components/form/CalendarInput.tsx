import { IonDatetime, IonModal } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import './CalendarInputStyles.css';
import { ActionType, Lang } from '../../utils/constants';
import TextInput from './TextInput';

interface CalendarInputProps {
  id: string;
  value: string | undefined | null;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  actionTarget: number;
  actionType: ActionType;
  label: string;
  disabled?: boolean;
}

const CalendarInput: React.FC<CalendarInputProps> = ({ id, value, setValue, actionTarget, actionType, label, disabled }) => {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);

  const dateRef = useRef<null | HTMLIonDatetimeElement>(null);

  const handleDateChange = (value: string) => {
    const formattedDate = format(parseISO(value), 'dd.MM.yyyy');
    handleChange(formattedDate);
  };

  const handleChange = (newValue: string | number | null | undefined) => {
    console.log(setValue);
    console.log(actionTarget);
    console.log(newValue);
    console.log(id);
    console.log(disabled);
  };

  return (
    <>
      <IonModal keepContentsMounted={true} isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
        <IonDatetime
          ref={dateRef}
          value={value}
          id={id}
          showDefaultButtons={true}
          multiple={false}
          presentation="date"
          locale="fi"
          onIonChange={(event) => handleDateChange(String(event.detail?.value))}
        >
          <span slot="title">{t('fairwaycard.temporary-notification-start')}</span>
        </IonDatetime>
      </IonModal>

      <TextInput label={label} val={value} setValue={setValue} actionType={actionType} setModalOpen={setModalOpen} />
    </>
  );
};

export default CalendarInput;

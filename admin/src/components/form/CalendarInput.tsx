import { IonButton, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonText } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Icon from '../../theme/img/calendar_icon.svg';
import './CalendarInputStyles.css';
import { ActionType, Lang } from '../../utils/constants';

interface CalendarInputProps {
  id: string;
  value: string | undefined | null;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  actionTarget: number;
  disabled?: boolean;
}

const CalendarInput: React.FC<CalendarInputProps> = ({ id, value, setValue, actionTarget, disabled }) => {
  const { t } = useTranslation();

  const [isTouched, setIsTouched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const dateButtonRef = useRef<HTMLIonDatetimeButtonElement>(null);
  const dateRef = useRef<null | HTMLIonDatetimeElement>(null);
  const dateInputRef = useRef<null | HTMLIonInputElement>(null);

  const handleDateClick = () => {
    setModalOpen(true);
  };

  const handleDateChange = (value: string) => {
    const formattedDate = format(parseISO(value), 'dd.MM.yyyy');
    handleChange(formattedDate);
  };

  const handleChange = (newValue: string | number | null | undefined) => {
    console.log(isTouched);
    console.log(setValue);
    console.log(actionTarget);
    console.log(newValue);
    console.log(id);
  };

  return (
    <>
      <IonDatetimeButton ref={dateButtonRef} datetime={id} className="hiddenDateButton" />
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

      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')}>
        <IonText>{t('fairwaycard.temporary-notification-start')}</IonText>
      </IonLabel>
      <div className="dateItemWrapper">
        <IonItem className="dateItem">
          <IonInput
            ref={dateInputRef}
            className="dateInput"
            value={value}
            onIonBlur={() => {
              setIsTouched(true);
            }}
          />
          <IonButton fill="clear" onClick={() => handleDateClick()}>
            <IonIcon icon={Icon} className="dateIcon" />
          </IonButton>
        </IonItem>
      </div>
    </>
  );
};

export default CalendarInput;

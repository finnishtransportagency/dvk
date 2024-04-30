import { IonButton, IonCol, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonRow, IonText } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { ActionType, Lang } from '../../utils/constants';
import './CalendarInputStyles.css';
import Icon from '../../theme/img/calendar_icon.svg';

interface CalendarInputProps {
  idx: number;
  label: string;
  disabled?: boolean;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
}

const CalendarInput: React.FC<CalendarInputProps> = ({ idx, label, disabled, setValue }) => {
  const [startDate, setStartDate] = useState<string | null>(new Date().toISOString());
  const [endDate, setEndDate] = useState<string | null>(null);

  const startDateButtonRef = useRef<HTMLIonDatetimeButtonElement>(null);
  const endDateButtonRef = useRef<HTMLIonDatetimeButtonElement>(null);
  const startDateRef = useRef<null | HTMLIonDatetimeElement>(null);
  const endDateRef = useRef<null | HTMLIonDatetimeElement>(null);

  const handleStartDateClick = () => {
    const startDateButton = startDateButtonRef.current?.shadowRoot?.querySelector('#date-button') as HTMLButtonElement;
    startDateButton.click();
  };

  const handleEndDateClick = () => {
    console.log(setValue);
    const endDateButton = endDateButtonRef.current?.shadowRoot?.querySelector('#date-button') as HTMLButtonElement;
    endDateButton.click();
  };

  return (
    <>
      <IonDatetimeButton ref={startDateButtonRef} datetime={'startDate' + idx} className="hiddenDateButton" />
      <IonModal keepContentsMounted={true}>
        <IonDatetime
          ref={startDateRef}
          value={startDate}
          id={'startDate' + idx}
          showDefaultButtons={true}
          multiple={false}
          presentation="date"
          locale="fi"
          onIonChange={(event) => setStartDate(String(event.detail?.value))}
        />
      </IonModal>

      <IonDatetimeButton ref={endDateButtonRef} datetime={'endDate' + idx} className="hiddenDateButton" />
      <IonModal keepContentsMounted={true}>
        <IonDatetime
          ref={endDateRef}
          value={endDate}
          id={'endDate' + idx}
          showDefaultButtons={true}
          multiple={false}
          presentation="date"
          locale="fi"
          onIonChange={(event) => setEndDate(String(event.detail?.value))}
        />
      </IonModal>

      <IonRow className="bordered">
        <IonCol sizeMd="4">
          <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')}>
            <IonText>{label}</IonText>
          </IonLabel>
          <div className="dateItemWrapper">
            <IonItem className="dateItem">
              <IonInput className="dateInput" value={startDate} />
              <IonButton fill="clear" onClick={() => handleStartDateClick()}>
                <IonIcon icon={Icon} className="dateIcon" />
              </IonButton>
            </IonItem>
          </div>
        </IonCol>
        <IonCol size="3.9">
          <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')}>
            <IonText>{label}</IonText>
          </IonLabel>
          <div className="dateItemWrapper">
            <IonItem className="dateItem">
              <IonInput className="dateInput" value={endDate} />
              <IonButton fill="clear" onClick={() => handleEndDateClick()}>
                <IonIcon icon={Icon} className="dateIcon" />
              </IonButton>
            </IonItem>
          </div>
        </IonCol>
      </IonRow>
    </>
  );
};

export default CalendarInput;

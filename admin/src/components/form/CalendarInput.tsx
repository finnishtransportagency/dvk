import { IonButton, IonCol, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonRow, IonText } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { ActionType, Lang } from '../../utils/constants';
import './CalendarInputStyles.css';
import Icon from '../../theme/img/calendar_icon.svg';
import { useTranslation } from 'react-i18next';

interface CalendarInputProps {
  idx: number;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  disabled?: boolean;
}

const CalendarInput: React.FC<CalendarInputProps> = ({ idx, setValue, disabled }) => {
  const { t } = useTranslation();

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
        >
          <span slot="title">{t('fairwaycard.temporary-notification-start')}</span>
        </IonDatetime>
      </IonModal>

      <IonDatetimeButton ref={endDateButtonRef} datetime={'endDate' + idx} className="hiddenDateButton" />
      <IonModal keepContentsMounted={true}>
        <IonDatetime
          ref={endDateRef}
          value={endDate ?? ''}
          id={'endDate' + idx}
          showDefaultButtons={true}
          multiple={false}
          presentation="date"
          locale="fi"
          onIonChange={(event) => setEndDate(String(event.detail?.value))}
        >
          <span slot="title">{t('fairwaycard.temporary-notification-end')}</span>
        </IonDatetime>
      </IonModal>

      <IonRow className="bordered">
        <IonCol sizeMd="4">
          <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')}>
            <IonText>{t('fairwaycard.temporary-notification-start')}</IonText>
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
            <IonText>{t('fairwaycard.temporary-notification-end')}</IonText>
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

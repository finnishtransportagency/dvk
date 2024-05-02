import { IonButton, IonCol, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonRow, IonText } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { ActionType, Lang } from '../../utils/constants';
import './CalendarInputStyles.css';
import Icon from '../../theme/img/calendar_icon.svg';
import { useTranslation } from 'react-i18next';
import { checkInputValidity } from '../../utils/common';
import { format, parseISO } from 'date-fns';
import { TemporaryNotificationInput } from '../../graphql/generated';

interface CalendarInputProps {
  idx: number;
  section: TemporaryNotificationInput;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  disabled?: boolean;
}

const CalendarInput: React.FC<CalendarInputProps> = ({ idx, section, setValue, disabled }) => {
  const { t } = useTranslation();

  const [isTouched, setIsTouched] = useState(false);

  const startDateButtonRef = useRef<HTMLIonDatetimeButtonElement>(null);
  const endDateButtonRef = useRef<HTMLIonDatetimeButtonElement>(null);
  const startDateRef = useRef<null | HTMLIonDatetimeElement>(null);
  const endDateRef = useRef<null | HTMLIonDatetimeElement>(null);

  const startDateInputRef = useRef<null | HTMLIonInputElement>(null);
  const endDateInputRef = useRef<null | HTMLIonInputElement>(null);

  const handleStartDateClick = () => {
    const startDateButton = startDateButtonRef.current?.shadowRoot?.querySelector('#date-button') as HTMLButtonElement;
    startDateButton.click();
  };

  const handleEndDateClick = () => {
    console.log(setValue);
    const endDateButton = endDateButtonRef.current?.shadowRoot?.querySelector('#date-button') as HTMLButtonElement;
    endDateButton.click();
  };

  const handleStartDateChange = (value: string) => {
    const formattedDate = format(parseISO(value), 'MM.dd.yyyy');
    handleChange(formattedDate);
  };

  const handleEndDateChange = (value: string) => {
    const formattedDate = format(parseISO(value), 'MM.dd.yyyy');
    handleChange(formattedDate);
  };

  const handleChange = (newValue: string | number | null | undefined) => {
    console.log(checkInputValidity);
    console.log(isTouched);
    console.log(newValue);
  };

  return (
    <>
      <IonDatetimeButton ref={startDateButtonRef} datetime={'startDate' + idx} className="hiddenDateButton" />
      <IonModal keepContentsMounted={true}>
        <IonDatetime
          ref={startDateRef}
          value={section?.startDate}
          id={'startDate' + idx}
          showDefaultButtons={true}
          multiple={false}
          presentation="date"
          locale="fi"
          onIonChange={(event) => handleStartDateChange(String(event.detail?.value))}
        >
          <span slot="title">{t('fairwaycard.temporary-notification-start')}</span>
        </IonDatetime>
      </IonModal>

      <IonDatetimeButton ref={endDateButtonRef} datetime={'endDate' + idx} className="hiddenDateButton" />
      <IonModal keepContentsMounted={true}>
        <IonDatetime
          ref={endDateRef}
          value={section?.endDate}
          id={'endDate' + idx}
          showDefaultButtons={true}
          multiple={false}
          presentation="date"
          locale="fi"
          onIonChange={(event) => handleEndDateChange(String(event.detail?.value))}
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
              <IonInput
                ref={startDateInputRef}
                className="dateInput"
                value={section?.startDate ?? ''}
                onIonBlur={() => {
                  setIsTouched(true);
                }}
              />
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
              <IonInput
                ref={endDateInputRef}
                className="dateInput"
                value={section?.endDate ?? ''}
                onIonBlur={() => {
                  setIsTouched(true);
                }}
                onIonChange={(ev) => handleChange(ev.target.value)}
                onIonInput={(ev) => handleChange(ev.target.value)}
              />
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

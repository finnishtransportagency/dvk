import { IonCol, IonRow } from '@ionic/react';
import React from 'react';
import { ActionType, Lang } from '../../utils/constants';
import './CalendarInputStyles.css';
import { TemporaryNotificationInput } from '../../graphql/generated';
import CalendarInput from './CalendarInput';

interface CalendarInputRowProps {
  idx: number;
  section: TemporaryNotificationInput;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
}

const CalendarInputRow: React.FC<CalendarInputRowProps> = ({ idx, section, setValue }) => {
  return (
    <IonRow className="bordered">
      <IonCol sizeMd="4">
        <CalendarInput id={'startDate' + idx} value={section.startDate} setValue={setValue} actionTarget={idx} />
      </IonCol>
      <IonCol size="3.9">
        <CalendarInput id={'endDate' + idx} value={section.endDate} setValue={setValue} actionTarget={idx} />
      </IonCol>
    </IonRow>
  );
};

export default CalendarInputRow;

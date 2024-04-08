import { IonLabel, IonRow } from '@ionic/react';
import React from 'react';

interface Props {
  value: string;
  lastCell?: boolean;
}

const DataTableTitleRow: React.FC<Props> = (props) => {
  return (
    <IonRow className={props.lastCell ? 'titleRow' : 'titleRow cellRightBorder'}>
      <IonLabel>{props.value}</IonLabel>
    </IonRow>
  );
};

export default DataTableTitleRow;

import { IonCol, IonLabel } from '@ionic/react';
import React from 'react';

interface Props {
  value: string;
  columnCount?: number;
}

const DataTableTitleColumn: React.FC<Props> = (props) => {
  return (
    <IonCol size={props.columnCount && props.columnCount > 11 ? '2' : '3'} className="titleCol">
      <IonLabel>{props.value}</IonLabel>
    </IonCol>
  );
};

export default DataTableTitleColumn;

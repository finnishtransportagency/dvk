import { IonCol, IonLabel } from '@ionic/react';
import React from 'react';

interface Props {
  value: string;
}
const DataTableTitleColumn: React.FC<Props> = (props) => {
  return (
    <IonCol size="3" className="titleCol">
      <IonLabel>{props.value}</IonLabel>
    </IonCol>
  );
};

export default DataTableTitleColumn;

import { IonCol } from '@ionic/react';
import React from 'react';

interface Props {
  value: string;
}
const DataTableTitleColumn: React.FC<Props> = (props) => {
  return (
    <IonCol sizeXs="2" style={{ borderBottom: '1px solid lightgrey' }}>
      <b>{props.value}</b>
    </IonCol>
  );
};

export default DataTableTitleColumn;

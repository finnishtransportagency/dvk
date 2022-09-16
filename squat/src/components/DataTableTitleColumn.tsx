import { IonCol } from '@ionic/react';
import React from 'react';

interface Props {
  value: string;
}
const DataTableTitleColumn: React.FC<Props> = (props) => {
  return (
    <IonCol sizeXl="2" sizeLg="2" sizeMd="2" sizeSm="1" sizeXs="1" style={{ borderBottom: '1px solid lightgrey' }}>
      <b>{props.value}</b>
    </IonCol>
  );
};

export default DataTableTitleColumn;

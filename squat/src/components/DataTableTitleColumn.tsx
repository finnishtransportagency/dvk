import { IonCol } from '@ionic/react';
import React from 'react';

interface Props {
  value: string;
}
const DataTableTitleColumn: React.FC<Props> = (props) => {
  return (
    <IonCol sizeMd="2" sizeSm="2" sizeXs="2" className="titleCol">
      <b>{props.value}</b>
    </IonCol>
  );
};

export default DataTableTitleColumn;

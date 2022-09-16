import { IonCol } from '@ionic/react';
import React from 'react';

interface Props {
  value: string | undefined;
  color?: DATACOLORS;
}
export enum DATACOLORS {
  WARN = 'mistyrose',
  PASS = 'palegreen',
  NEUTRAL = 'white',
}
const DataTableDataColumn: React.FC<Props> = (props) => {
  return (
    <IonCol style={{ borderLeft: '1px solid lightgrey', borderBottom: '1px solid lightgrey', backgroundColor: props.color }}>
      {props.value?.replace('.', ',')}
    </IonCol>
  );
};

export default DataTableDataColumn;

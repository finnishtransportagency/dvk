import { IonCol } from '@ionic/react';
import React from 'react';

interface Props {
  value: string | undefined;
  color?: DATACOLOR;
}
export enum DATACOLOR {
  WARN = '#fdf6f6',
  PASS = '#f5ffef',
  NEUTRAL = 'white',
}
const DataTableDataColumn: React.FC<Props> = (props) => {
  return (
    <IonCol sizeXs="0.9" className="dataCol" style={{ backgroundColor: props.color }}>
      {props.value?.replace('.', ',')}
    </IonCol>
  );
};

export default DataTableDataColumn;

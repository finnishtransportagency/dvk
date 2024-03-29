import { IonCol } from '@ionic/react';
import React from 'react';

interface Props {
  value: string | undefined;
  color?: DATACOLOR;
}
export enum DATACOLOR {
  FROUDE = '#fdf6f6',
  SQUAT = '#f5ffef',
  NEUTRAL = 'white',
}
const DataTableDataColumn: React.FC<Props> = (props) => {
  return (
    <IonCol size="0.818" className="dataCol" style={{ backgroundColor: props.color }}>
      {props.value?.replace('.', ',')}
    </IonCol>
  );
};

export default DataTableDataColumn;

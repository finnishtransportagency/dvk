import { IonCol, IonRow } from '@ionic/react';
import React from 'react';

interface Props {
  value: string | undefined;
  row?: boolean | undefined;
  color?: DATACOLOR;
}
export enum DATACOLOR {
  FROUDE = '#fdf6f6',
  SQUAT = '#f5ffef',
  NEUTRAL = 'white',
}
const DataTableDataCell: React.FC<Props> = (props) => {
  return props.row ? (
    <IonRow style={{ backgroundColor: props.color }}>{props.value?.replace('.', ',')}</IonRow>
  ) : (
    <IonCol size="0.818" className="dataCol" style={{ backgroundColor: props.color }}>
      {props.value?.replace('.', ',')}
    </IonCol>
  );
};

export default DataTableDataCell;

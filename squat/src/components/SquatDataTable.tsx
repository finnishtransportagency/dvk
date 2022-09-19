import { IonGrid, IonRow } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { calculateFroudeNumber, knotsToMetresPerSecond } from '../utils/calculations';
import DataTableDataColumn, { DATACOLOR } from './DataTableDataColumn';
import DataTableTitleColumn from './DataTableTitleColumn';
import './SquatDataTable.css';

interface Props {
  huuskaGuliev24?: Array<[number, number]>;
  huuskaGuliev20?: Array<[number, number]>;
  barrass?: Array<[number, number]>;
}

const SquatDataTable: React.FC<Props> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squatDataTable' });
  const { state } = useSquatContext();
  const stepFactor = 10;

  const getSpeedData = () => {
    return state.status.showBarrass
      ? props.barrass?.filter((value, i) => i % stepFactor == 0)
      : props.huuskaGuliev20?.filter((value, i) => i % stepFactor == 0);
  };

  return (
    <IonGrid className="dataTableGrid">
      <IonRow className="dataTableRow">
        <DataTableTitleColumn value={t('aluksen-nopeus-kn')} />
        {getSpeedData()?.map((values, i) => {
          const speed = Math.round(values[0]);
          return <DataTableDataColumn key={'col' + i} value={speed.toFixed(1)} />;
        })}
      </IonRow>
      <IonRow className="dataTableRow">
        <DataTableTitleColumn value={t('aluksen-nopeus-ms')} />
        {getSpeedData()?.map((values, i) => {
          const speed = Math.round(values[0]);
          return <DataTableDataColumn key={'col' + i} value={knotsToMetresPerSecond(speed).toFixed(1)} />;
        })}
      </IonRow>
      <IonRow className="dataTableRow">
        <DataTableTitleColumn value={t('froude-syvyysluku')} />
        {getSpeedData()?.map((values, i) => {
          const speed = Math.round(values[0]);
          const froudeNumber = calculateFroudeNumber(speed, state.environment.fairway.sweptDepth, state.environment.fairway.waterLevel);
          return (
            <DataTableDataColumn key={'col' + i} value={froudeNumber.toFixed(2)} color={froudeNumber > 0.7 ? DATACOLOR.WARN : DATACOLOR.NEUTRAL} />
          );
        })}
      </IonRow>
      {!state.status.showBarrass && (
        <>
          <IonRow className="dataTableRow">
            <DataTableTitleColumn
              value={t('squat-max', {
                kerroin: '2,0',
              })}
            />
            {props.huuskaGuliev20
              ?.filter((data, i) => i % stepFactor == 0)
              .map((values, i) => {
                return <DataTableDataColumn key={'col' + i} value={values[1].toFixed(2)} color={DATACOLOR.PASS} />;
              })}
          </IonRow>
          <IonRow className="dataTableRow">
            <DataTableTitleColumn value={t('squat-max', { kerroin: '2,4' })} />
            {props.huuskaGuliev24
              ?.filter((data, i) => i % stepFactor == 0)
              .map((values, i) => {
                return <DataTableDataColumn key={'col' + i} value={values[1].toFixed(2)} color={DATACOLOR.PASS} />;
              })}
          </IonRow>
        </>
      )}
      {state.status.showBarrass && (
        <>
          <IonRow className="dataTableRow">
            <DataTableTitleColumn value={t('squat-max', { kerroin: undefined })} />
            {props.barrass
              ?.filter((data, i) => i % stepFactor == 0)
              .map((values, i) => {
                return <DataTableDataColumn key={'col' + i} value={values[1].toFixed(2)} color={DATACOLOR.PASS} />;
              })}
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default SquatDataTable;

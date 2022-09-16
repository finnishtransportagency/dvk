import { IonGrid, IonRow } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { calculateFroudeNumber, knotsToMetresPerSecond } from '../utils/calculations';
import DataTableDataColumn, { DATACOLORS } from './DataTableDataColumn';
import DataTableTitleColumn from './DataTableTitleColumn';

interface Props {
  huuskaGuliev24?: Array<[number, number]>;
  huuskaGuliev20?: Array<[number, number]>;
  barrass?: Array<[number, number]>;
}

const SquatDataTable: React.FC<Props> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squatDataTable' });
  const { state } = useSquatContext();
  const stepFactor = 10;
  return (
    <IonGrid>
      <IonRow>
        <DataTableTitleColumn value={t('aluksen-nopeus-kn')} />
        {props.huuskaGuliev20?.map((values, i) => {
          if (i % stepFactor == 0) {
            const speed = Math.round(values[0]);
            return <DataTableDataColumn key={'col' + i} value={speed.toFixed(1)} />;
          }
        })}
      </IonRow>
      <IonRow>
        <DataTableTitleColumn value={t('aluksen-nopeus-ms')} />
        {props.huuskaGuliev20?.map((values, i) => {
          if (i % stepFactor == 0) {
            const speed = Math.round(values[0]);
            return <DataTableDataColumn key={'col' + i} value={knotsToMetresPerSecond(speed).toFixed(1)} />;
          }
        })}
      </IonRow>
      <IonRow>
        <DataTableTitleColumn value={t('froude-syvyysluku')} />
        {props.huuskaGuliev20?.map((values, i) => {
          if (i % stepFactor == 0) {
            const speed = Math.round(values[0]);
            const froudeNumber = calculateFroudeNumber(speed, state.environment.fairway.sweptDepth, state.environment.fairway.waterLevel);
            return (
              <DataTableDataColumn
                key={'col' + i}
                value={froudeNumber.toFixed(2)}
                color={froudeNumber > 0.7 ? DATACOLORS.WARN : DATACOLORS.NEUTRAL}
              />
            );
          }
        })}
      </IonRow>
      {!state.status.showBarrass && (
        <>
          <IonRow>
            <DataTableTitleColumn
              value={t('squat-max', {
                kerroin: '2,0',
              })}
            />
            {props.huuskaGuliev20?.map((values, i) => {
              if (i % stepFactor == 0) {
                return <DataTableDataColumn key={'col' + i} value={values[1].toFixed(2)} color={DATACOLORS.PASS} />;
              }
            })}
          </IonRow>
          <IonRow>
            <DataTableTitleColumn value={t('squat-max', { kerroin: '2,4' })} />
            {props.huuskaGuliev24?.map((values, i) => {
              if (i % stepFactor == 0) {
                return <DataTableDataColumn key={'col' + i} value={values[1].toFixed(2)} color={DATACOLORS.PASS} />;
              }
            })}
          </IonRow>
        </>
      )}
      {state.status.showBarrass && (
        <>
          <IonRow>
            <DataTableTitleColumn value={t('squat-max', { kerroin: undefined })} />
            {props.barrass?.map((values, i) => {
              if (i % stepFactor == 0) {
                return <DataTableDataColumn key={'col' + i} value={values[1].toFixed(2)} color={DATACOLORS.PASS} />;
              }
            })}
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default SquatDataTable;

import { IonCol, IonGrid, IonRow } from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { isEmbedded } from '../pages/Home';
import { calculateFroudeNumber, knotsToMetresPerSecond } from '../utils/calculations';
import DataTableDataColumn, { DATACOLOR } from './DataTableDataColumn';
import DataTableTitleColumn from './DataTableTitleColumn';
import './SquatDataTable.css';
import { fieldParams } from '../hooks/squatReducer';
import uniqueId from 'lodash/uniqueId';

interface Props {
  huuskaGuliev24?: Array<[number, number]>;
  huuskaGuliev20?: Array<[number, number]>;
  barrass?: Array<[number, number]>;
}

const SquatDataTable: React.FC<Props> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squatDataTable' });
  const { state } = useSquatContext();
  const stepFactor = 10;
  const [speeds, setSpeeds] = useState(Array<number>);

  const { showLimitedView: limitedView } = state.status;
  const sweptDepth = state.environment.fairway.sweptDepth;
  const waterLevel = limitedView ? fieldParams.waterLevel.default : state.environment.fairway.waterLevel;

  const getPaddedHuuskaGuliev24Data = useCallback(() => {
    const paddedArray: Array<number> = [];
    props.huuskaGuliev24?.forEach((values) => {
      if (speeds.includes(values[0])) {
        paddedArray.push(values[1]);
      }
    });
    for (let i = paddedArray.length; i < speeds.length; i++) {
      paddedArray.push(-1);
    }
    return paddedArray;
  }, [speeds, props]);

  const filterSpeeds = (value: [number, number], index: number) => {
    return index % stepFactor === 0;
  };

  const getSpeedData = useCallback(() => {
    return state.status.showBarrass ? props.barrass?.filter(filterSpeeds) : props.huuskaGuliev20?.filter(filterSpeeds);
  }, [state.status.showBarrass, props]);

  useEffect(() => {
    setSpeeds(
      getSpeedData()?.map((values) => {
        return values[0];
      }) ?? []
    );
  }, [getSpeedData]);

  return (
    <IonGrid className={'dataTableGrid' + (speeds.length < 1 ? ' no-data' : '')}>
      <IonRow className="ion-align-items-center dataTableLegend" style={isEmbedded() ? { paddingLeft: '1px' } : undefined}>
        <IonCol size="auto">
          <div className="squatSquare" />
        </IonCol>
        <IonCol size="auto">{t('froude-varoitus')}</IonCol>
        <IonCol size="auto">
          <div className="froudeSquare" />
        </IonCol>
        <IonCol>{t('squat-tulokset')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonGrid className="ion-no-left-padding">
            <IonRow className="dataTableRow">
              <DataTableTitleColumn value={t('aluksen-nopeus-kn')} />
              {speeds?.map((speed) => {
                const uuid = uniqueId('col_');
                return <DataTableDataColumn key={uuid} value={speed.toFixed(1)} />;
              })}
            </IonRow>
            <IonRow className="dataTableRow">
              <DataTableTitleColumn value={t('aluksen-nopeus-ms')} />
              {speeds?.map((speed) => {
                const uuid = uniqueId('col_');
                return <DataTableDataColumn key={uuid} value={knotsToMetresPerSecond(speed).toFixed(1)} />;
              })}
            </IonRow>
            <IonRow className="dataTableRow">
              <DataTableTitleColumn value={t('froude-syvyysluku')} />
              {speeds?.map((speed) => {
                const froudeNumber = calculateFroudeNumber(speed, sweptDepth, waterLevel);
                const uuid = uniqueId('col_');
                return (
                  <DataTableDataColumn key={uuid} value={froudeNumber.toFixed(2)} color={froudeNumber > 0.7 ? DATACOLOR.FROUDE : DATACOLOR.NEUTRAL} />
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
                  {props.huuskaGuliev20?.filter(filterSpeeds).map((values) => {
                    const uuid = uniqueId('col_');
                    return <DataTableDataColumn key={uuid} value={values[1].toFixed(2)} color={DATACOLOR.SQUAT} />;
                  })}
                </IonRow>
                <IonRow className="dataTableRow">
                  <DataTableTitleColumn value={t('squat-max', { kerroin: '2,4' })} />
                  {getPaddedHuuskaGuliev24Data().map((value) => {
                    const uuid = uniqueId('col_');
                    return <DataTableDataColumn key={uuid} value={value >= 0 ? value.toFixed(2) : '-'} color={DATACOLOR.SQUAT} />;
                  })}
                </IonRow>
              </>
            )}
            {state.status.showBarrass && (
              <>
                <IonRow className="dataTableRow">
                  <DataTableTitleColumn value={t('squat-max', { kerroin: undefined })} />
                  {props.barrass?.filter(filterSpeeds).map((values) => {
                    const uuid = uniqueId('col_');
                    return <DataTableDataColumn key={uuid} value={values[1].toFixed(2)} color={DATACOLOR.SQUAT} />;
                  })}
                </IonRow>
              </>
            )}
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default SquatDataTable;

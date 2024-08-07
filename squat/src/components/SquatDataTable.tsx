import { IonCol, IonGrid, IonRow } from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { isEmbedded } from '../pages/Home';
import { calculateFroudeNumber, knotsToMetresPerSecond } from '../utils/calculations';
import DataTableDataCell, { DATACOLOR } from './DataTableDataCell';
import DataTableTitleColumn from './DataTableTitleColumn';
import './SquatDataTable.css';
import { fieldParams } from '../hooks/squatReducer';
import uniqueId from 'lodash/uniqueId';
import DataTableTitleRow from './DataTableTitleRow';

interface Props {
  speeds: Array<number>;
  sweptDepth: number;
  waterLevel: number;
  filterSpeeds: (value: [number, number], index: number) => boolean;
  getPaddedHuuskaGuliev24Data: () => Array<number>;
  huuskaGuliev20?: Array<[number, number]>;
  barrass?: Array<[number, number]>;
}

const WideSquatDataTable: React.FC<Props> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squatDataTable' });
  const { state } = useSquatContext();

  return (
    <IonGrid className={'dataTableGrid' + (props.speeds.length < 1 ? ' no-data' : '')}>
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
              <DataTableTitleColumn value={t('aluksen-nopeus-kn')} columnCount={props.speeds.length} />
              {props.speeds?.map((speed) => {
                const uuid = uniqueId('col_');
                return <DataTableDataCell key={uuid} value={speed.toFixed(1)} />;
              })}
            </IonRow>
            <IonRow className="dataTableRow">
              <DataTableTitleColumn value={t('aluksen-nopeus-ms')} columnCount={props.speeds.length} />
              {props.speeds?.map((speed) => {
                const uuid = uniqueId('col_');
                return <DataTableDataCell key={uuid} value={knotsToMetresPerSecond(speed).toFixed(1)} />;
              })}
            </IonRow>
            <IonRow className="dataTableRow">
              <DataTableTitleColumn value={t('froude-syvyysluku')} columnCount={props.speeds.length} />
              {props.speeds?.map((speed) => {
                const froudeNumber = calculateFroudeNumber(speed, props.sweptDepth, props.waterLevel);
                const uuid = uniqueId('col_');
                return <DataTableDataCell key={uuid} value={froudeNumber.toFixed(2)} color={froudeNumber > 0.7 ? DATACOLOR.FROUDE : undefined} />;
              })}
            </IonRow>
            {!state.status.showBarrass && (
              <>
                <IonRow className="dataTableRow">
                  <DataTableTitleColumn
                    value={t('squat-max', {
                      kerroin: '2,0',
                    })}
                    columnCount={props.speeds.length}
                  />
                  {props.huuskaGuliev20?.filter(props.filterSpeeds).map((values) => {
                    const uuid = uniqueId('col_');
                    return <DataTableDataCell key={uuid} value={values[1].toFixed(2)} color={DATACOLOR.SQUAT} />;
                  })}
                </IonRow>
                <IonRow className="dataTableRow">
                  <DataTableTitleColumn value={t('squat-max', { kerroin: '2,4' })} columnCount={props.speeds.length} />
                  {props.getPaddedHuuskaGuliev24Data().map((value) => {
                    const uuid = uniqueId('col_');
                    return <DataTableDataCell key={uuid} value={value >= 0 ? value.toFixed(2) : '-'} color={DATACOLOR.SQUAT} />;
                  })}
                </IonRow>
              </>
            )}
            {state.status.showBarrass && (
              <IonRow className="dataTableRow">
                <DataTableTitleColumn value={t('squat-max', { kerroin: undefined })} columnCount={props.speeds.length} />
                {props.barrass?.filter(props.filterSpeeds).map((values) => {
                  const uuid = uniqueId('col_');
                  return <DataTableDataCell key={uuid} value={values[1].toFixed(2)} color={DATACOLOR.SQUAT} />;
                })}
              </IonRow>
            )}
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

const NarrowSquatDataTable: React.FC<Props> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squatDataTable' });
  const { state } = useSquatContext();

  return (
    <IonGrid className={'dataTableGrid ion-no-padding' + (props.speeds.length < 1 ? ' no-data' : '')}>
      <IonRow className="ion-align-items-center dataTableLegend" style={isEmbedded() ? { paddingLeft: '1px' } : undefined}>
        <IonCol size="auto">
          <div className="squatSquareSmall" />
        </IonCol>
        <IonCol size="auto" className="legendCol">
          {t('froude-varoitus')}
        </IonCol>
        <IonCol size="auto">
          <div className="froudeSquareSmall" />
        </IonCol>
        <IonCol className="legendCol">{t('squat-tulokset')}</IonCol>
      </IonRow>
      <IonRow style={{ padding: '5px 0px 0px 0px' }}>
        <IonCol>
          <IonRow className="ion-no-padding">
            <IonCol className="dataTableCol ion-no-padding">
              <DataTableTitleRow value={t('aluksen-nopeus-kn')} />
              {props.speeds?.map((speed) => {
                const uuid = uniqueId('col_');
                return <DataTableDataCell key={uuid} value={speed.toFixed(1)} row={true} />;
              })}
            </IonCol>
            <IonCol className="dataTableCol">
              <DataTableTitleRow value={t('aluksen-nopeus-ms')} />
              {props.speeds?.map((speed) => {
                const uuid = uniqueId('col_');
                return <DataTableDataCell key={uuid} value={knotsToMetresPerSecond(speed).toFixed(1)} row={true} />;
              })}
            </IonCol>
            <IonCol className="dataTableCol">
              <DataTableTitleRow value={t('froude-syvyysluku')} />
              {props.speeds?.map((speed) => {
                const froudeNumber = calculateFroudeNumber(speed, props.sweptDepth, props.waterLevel);
                const uuid = uniqueId('col_');
                return (
                  <DataTableDataCell
                    key={uuid}
                    value={froudeNumber.toFixed(2)}
                    row={true}
                    /* undefined results to default cell color */
                    color={froudeNumber > 0.7 ? DATACOLOR.FROUDE : undefined}
                  />
                );
              })}
            </IonCol>
            {!state.status.showBarrass && (
              <>
                <IonCol className="dataTableCol">
                  <DataTableTitleRow
                    value={t('squat-max', {
                      kerroin: '2,0',
                    })}
                  />
                  {props.huuskaGuliev20?.filter(props.filterSpeeds).map((values) => {
                    const uuid = uniqueId('col_');
                    return <DataTableDataCell key={uuid} value={values[1].toFixed(2)} row={true} color={DATACOLOR.SQUAT} />;
                  })}
                </IonCol>
                <IonCol className="dataTableCol">
                  <DataTableTitleRow value={t('squat-max', { kerroin: '2,4' })} lastCell={true} />
                  {props.getPaddedHuuskaGuliev24Data().map((value) => {
                    const uuid = uniqueId('col_');
                    return (
                      <DataTableDataCell key={uuid} value={value >= 0 ? value.toFixed(2) : '-'} row={true} color={DATACOLOR.SQUAT} lastCell={true} />
                    );
                  })}
                </IonCol>
              </>
            )}
            {state.status.showBarrass && (
              <IonCol size="auto" className="dataTableCol">
                <DataTableTitleRow value={t('squat-max', { kerroin: undefined })} lastCell={true} />
                {props.barrass?.filter(props.filterSpeeds).map((values) => {
                  const uuid = uniqueId('col_');
                  return <DataTableDataCell key={uuid} value={values[1].toFixed(2)} row={true} color={DATACOLOR.SQUAT} lastCell={true} />;
                })}
              </IonCol>
            )}
          </IonRow>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

interface SquatDataTableProps {
  huuskaGuliev24?: Array<[number, number]>;
  huuskaGuliev20?: Array<[number, number]>;
  barrass?: Array<[number, number]>;
  wideChart?: boolean;
}

const SquatDataTable: React.FC<SquatDataTableProps> = (props) => {
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

  if (props.wideChart) {
    return (
      <WideSquatDataTable
        speeds={speeds}
        sweptDepth={sweptDepth}
        waterLevel={waterLevel}
        filterSpeeds={filterSpeeds}
        getPaddedHuuskaGuliev24Data={getPaddedHuuskaGuliev24Data}
        huuskaGuliev20={props.huuskaGuliev20}
        barrass={props.barrass}
      />
    );
  } else {
    return (
      <NarrowSquatDataTable
        speeds={speeds}
        sweptDepth={sweptDepth}
        waterLevel={waterLevel}
        filterSpeeds={filterSpeeds}
        getPaddedHuuskaGuliev24Data={getPaddedHuuskaGuliev24Data}
        huuskaGuliev20={props.huuskaGuliev20}
        barrass={props.barrass}
      />
    );
  }
};

export default SquatDataTable;

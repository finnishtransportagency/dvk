import React, { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { IonText, IonGrid, IonRow, IonCol, IonLabel, IonSegment, IonSegmentButton } from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import {
  calculateApparentWindProperties,
  calculateBowThrusterForce,
  calculateDraughtDueWind,
  calculateDraughtDuringTurn,
  calculateEstimatedBreadth,
  calculateEstimatedDriftAngle,
  calculateHeelDueWind,
  calculateHeelDuringTurn,
  calculateMinimumExternalForce,
  calculateSafetyMargin,
  calculateSquatBarrass,
  calculateSquatHG,
  calculateUKCDuringTurn,
  calculateUKCStraightCourse,
  calculateUKCVesselMotions,
  calculateWaveForce,
  calculateWindForce,
  getNumberValueOrEmptyString,
  toDeg,
} from '../utils/calculations';

import Alert from './Alert';
import SectionTitle from './SectionTitle';
import LabelField from './LabelField';
import {
  isBreadthDraughtRatioOutOfRange,
  isExternalForceRequired,
  isLengthBreadthRatioOutOfRange,
  isReliabilityAnIssue,
  isSafetyMarginInsufficient,
  isUKCDuringTurnUnderRequired,
  isUKCShipMotionsUnderRequired,
  isUKCStraightUnderRequired,
  isUKCUnderMinimum,
} from '../utils/validations';
import Modal from './Modal';
import { IonSegmentCustomEvent, SegmentChangeEventDetail } from '@ionic/core';

const Calculations: React.FC = () => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.squat.calculations' });
  const { state, dispatch } = useSquatContext();
  const tRoot = i18n.getFixedT(i18n.language);

  // Validations
  const checkIsReliabilityAnIssue = () => {
    return isReliabilityAnIssue(
      state.vessel.general.blockCoefficient,
      state.environment.vessel.vesselSpeed,
      state.environment.fairway.sweptDepth,
      state.environment.fairway.waterLevel,
      state.status.showBarrass
    );
  };
  const checkIsUKCUnderMinimum = () => {
    return isUKCUnderMinimum(
      state.environment.fairway.sweptDepth,
      state.environment.attribute.requiredUKC,
      state.calculations.squat.UKCDuringTurn,
      state.calculations.squat.UKCStraightCourse,
      state.calculations.squat.UKCVesselMotions,
      state.status.showBarrass
    );
  };

  // useEffects to calculate results by input value update
  // 1. Wind Force & 3. Drift
  useEffect(() => {
    // 1.1 Relative Wind Speed & Direction
    const [apparentWindVelocityDrift, apparentWindAngleDrift] = calculateApparentWindProperties(
      state.environment.vessel.vesselSpeed,
      state.environment.vessel.vesselCourse,
      state.environment.weather.windSpeed,
      state.environment.weather.windDirection
    );

    // 1.2 Wind Force
    const windForce = calculateWindForce(
      state.environment.attribute.airDensity,
      state.environment.weather.windSpeed,
      state.vessel.detailed.windSurface,
      apparentWindAngleDrift
    );

    // 1.3 Wave Force
    const waveForce = calculateWaveForce(
      state.environment.attribute.waterDensity,
      state.vessel.general.lengthBPP,
      state.environment.weather.waveHeight,
      apparentWindAngleDrift
    );

    // 1.4 Bow Thruster Force
    const bowThrusterForce = calculateBowThrusterForce(state.vessel.detailed.bowThruster, state.vessel.detailed.bowThrusterEfficiency);

    // 1.5 Remaining Safety Margin
    const remainingSafetyMargin = calculateSafetyMargin(bowThrusterForce, windForce, waveForce);

    // 1.6 Minimum External Force Required
    const minExternalForce = calculateMinimumExternalForce(bowThrusterForce, windForce, waveForce);

    // 3.1 Calculate drift angle for current vessel type
    const estimatedDriftAngle = calculateEstimatedDriftAngle(
      state.vessel.general.lengthBPP,
      state.vessel.general.draught,
      state.vessel.detailed.profileSelected.id - 1,
      state.environment.vessel.vesselSpeed,
      state.vessel.detailed.windSurface,
      state.environment.attribute.airDensity,
      state.environment.attribute.waterDensity,
      apparentWindAngleDrift,
      apparentWindVelocityDrift
    );

    // 3.2 Estimated breadth due to drift
    const estimatedBreadth = calculateEstimatedBreadth(state.vessel.general.lengthBPP, state.vessel.general.breadth, estimatedDriftAngle);

    // Update state object with wind/wave and drift computation results
    dispatch({
      type: 'calculations',
      payload: {
        key: 'forces',
        value: {
          relativeWindDirection: apparentWindAngleDrift,
          relativeWindSpeed: apparentWindVelocityDrift,
          windForce: windForce,
          waveForce: waveForce,
          bowThrusterForce: bowThrusterForce,
          remainingSafetyMargin: remainingSafetyMargin,
          externalForceRequired: minExternalForce,
          estimatedDriftAngle: estimatedDriftAngle,
          estimatedBreadth: estimatedBreadth,
        },
        elType: 'object',
      },
    });
  }, [
    state.vessel.general.lengthBPP,
    state.vessel.general.breadth,
    state.vessel.general.draught,
    state.vessel.detailed.windSurface,
    state.vessel.detailed.bowThruster,
    state.vessel.detailed.bowThrusterEfficiency,
    state.vessel.detailed.profileSelected,
    state.environment.weather.windSpeed,
    state.environment.weather.windDirection,
    state.environment.weather.waveHeight,
    state.environment.vessel.vesselSpeed,
    state.environment.vessel.vesselCourse,
    state.environment.attribute.airDensity,
    state.environment.attribute.waterDensity,
    dispatch,
  ]);

  // 2. Squat
  useEffect(() => {
    // 2.1 Heel Due Wind
    const heelDueWind = calculateHeelDueWind(
      state.vessel.general.lengthBPP,
      state.vessel.detailed.windSurface,
      state.vessel.general.displacement,
      state.vessel.stability.GM,
      state.vessel.stability.KB,
      state.calculations.forces.windForce
    );

    // 2.2 Heel During Turn
    const constantHeelDuringTurn = calculateHeelDuringTurn(
      state.environment.vessel.vesselSpeed,
      state.environment.vessel.turningRadius,
      state.vessel.stability.KG,
      state.vessel.stability.GM,
      state.vessel.stability.KB
    );

    // 2.3 Corrected Draught Due Wind
    const correctedDraught = calculateDraughtDueWind(state.vessel.general.breadth, state.vessel.general.draught, heelDueWind);

    // 2.4 Corrected Draught During Turn
    const correctedDraughtDuringTurn = calculateDraughtDuringTurn(state.vessel.general.breadth, state.vessel.general.draught, constantHeelDuringTurn);

    // 2.8 Squats
    const squatBarrass = calculateSquatBarrass(
      state.vessel.general.draught,
      state.vessel.general.blockCoefficient,
      state.environment.fairway.sweptDepth,
      state.environment.vessel.vesselSpeed
    );
    const [squatHG, squatHGListed] = calculateSquatHG(
      state.vessel.general.lengthBPP,
      state.vessel.general.breadth,
      state.vessel.general.draught,
      state.vessel.general.blockCoefficient,
      state.environment.fairway.sweptDepth,
      state.environment.fairway.waterLevel,
      state.environment.fairway.fairwayForm.id - 1,
      state.environment.fairway.channelWidth,
      state.environment.fairway.slopeScale,
      state.environment.fairway.slopeHeight,
      state.environment.vessel.vesselSpeed,
      correctedDraughtDuringTurn
    );

    // 2.6 UKC Straight Course
    const [UKCStraightCourseBarrass, UKCStraightCourseHG] = calculateUKCStraightCourse(
      state.environment.fairway.sweptDepth,
      state.environment.fairway.waterLevel,
      correctedDraught,
      squatBarrass,
      squatHG
    );

    // 2.7 UKC During Turn
    const [UKCDuringTurnBarrass, UKCDuringTurnHG] = calculateUKCDuringTurn(
      state.vessel.general.draught,
      state.environment.fairway.sweptDepth,
      state.environment.fairway.waterLevel,
      correctedDraughtDuringTurn,
      squatBarrass,
      squatHG
    );

    // 2.5 UKC Vessel Motions
    const [UKCVesselMotionBarrass, UKCVesselMotionHG] = calculateUKCVesselMotions(
      state.environment.weather.waveAmplitude,
      UKCStraightCourseBarrass,
      UKCStraightCourseHG
    );

    // Update state object with squat computation results
    dispatch({
      type: 'calculations',
      payload: {
        key: 'squat',
        value: {
          heelDueWind: heelDueWind,
          constantHeelDuringTurn: constantHeelDuringTurn,
          correctedDraught: correctedDraught,
          correctedDraughtDuringTurn: correctedDraughtDuringTurn,
          UKCVesselMotions: [UKCVesselMotionBarrass, UKCVesselMotionHG],
          UKCStraightCourse: [UKCStraightCourseBarrass, UKCStraightCourseHG],
          UKCDuringTurn: [UKCDuringTurnBarrass, UKCDuringTurnHG],
          squatBarrass: squatBarrass,
          squatHG: squatHG,
          squatHGListed: squatHGListed,
        },
        elType: 'object',
      },
    });
  }, [
    state.vessel.general.lengthBPP,
    state.vessel.general.breadth,
    state.vessel.general.draught,
    state.vessel.general.displacement,
    state.vessel.general.blockCoefficient,
    state.vessel.detailed.windSurface,
    state.vessel.stability.KG,
    state.vessel.stability.GM,
    state.vessel.stability.KB,
    state.environment.weather.waveAmplitude,
    state.environment.fairway.sweptDepth,
    state.environment.fairway.waterLevel,
    state.environment.fairway.fairwayForm,
    state.environment.fairway.channelWidth,
    state.environment.fairway.slopeScale,
    state.environment.fairway.slopeHeight,
    state.environment.vessel.vesselSpeed,
    state.environment.vessel.turningRadius,
    state.calculations.forces.windForce,
    dispatch,
  ]);

  // Update status to state
  const setStateStatus = useCallback(
    (key: string, value: string | undefined) => {
      dispatch({
        type: 'status',
        payload: { key: key, value: value === 'true', elType: 'boolean' },
      });
    },
    [dispatch]
  );

  // Determine values to show
  const getUKCVesselMotionValue = () => {
    const currentValue = state.calculations.squat.UKCVesselMotions[state.status.showBarrass ? 0 : 1][state.status.showDeepWaterValues ? 1 : 0];
    return getNumberValueOrEmptyString(currentValue);
  };
  const getUKCStraightCourseValue = () => {
    const currentValue = state.calculations.squat.UKCStraightCourse[state.status.showBarrass ? 0 : 1];
    return getNumberValueOrEmptyString(currentValue);
  };
  const getUKCDuringTurnValue = () => {
    const currentValue = state.calculations.squat.UKCDuringTurn[state.status.showBarrass ? 0 : 1];
    return getNumberValueOrEmptyString(currentValue);
  };
  const getSquatValue = () => {
    const currentValue = state.status.showBarrass ? state.calculations.squat.squatBarrass : state.calculations.squat.squatHG;
    return getNumberValueOrEmptyString(currentValue);
  };
  const printSquatHelper = () => {
    if (getSquatValue() !== '') return '(' + (state.status.showBarrass ? t('squat-barrass') : t('squat-HG')) + ')';
    return '';
  };

  const handleWaterValuesChange = useCallback(
    (e: IonSegmentCustomEvent<SegmentChangeEventDetail>) => {
      setStateStatus('showDeepWaterValues', e.detail.value);
    },
    [setStateStatus]
  );

  const handleCalculationMethodChange = useCallback(
    (e: IonSegmentCustomEvent<SegmentChangeEventDetail>) => {
      setStateStatus('showBarrass', e.detail.value);
    },
    [setStateStatus]
  );

  return (
    <>
      <div className="pagebreak"></div>
      <IonGrid className="ion-no-padding ion-no-margin">
        <IonRow>
          <IonCol size="auto" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <IonText color="dark" className="equal-margin-top">
              <h2>
                <strong>{t('title')}</strong>
              </h2>
            </IonText>
          </IonCol>
          <IonCol size="auto" className="ion-align-self-center" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Modal
              size="large"
              title={t('info-title')}
              content={
                <>
                  <div>
                    <Trans t={t} i18nKey="info-content-hg"></Trans>
                  </div>
                  <div>
                    <Trans t={t} i18nKey="info-content-barrass"></Trans>
                  </div>
                  <div>
                    <Trans t={t} i18nKey="info-content-assumptions"></Trans>
                  </div>
                </>
              }
            />
          </IonCol>
        </IonRow>
      </IonGrid>

      <>
        {checkIsUKCUnderMinimum() && <Alert title={t('UKC-under-required-minimum')} />}

        <div className="in-print top-padding">
          <span className="printable segment-label">{t('selected-water-values')}:</span>
          <IonSegment
            onIonChange={handleWaterValuesChange}
            value={state.status.showDeepWaterValues ? 'true' : 'false'}
            disabled={!state.environment.weather.waveLength[0]}
            selectOnFocus
          >
            <IonSegmentButton value="false">
              <IonLabel>{t('shallow-water-values')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="true">
              <IonLabel>{t('deep-water-values')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          <span className="printable segment-label">{t('selected-calculation-method')}:</span>
          <IonSegment
            onIonChange={handleCalculationMethodChange}
            value={state.status.showBarrass ? 'true' : 'false'}
            className="top-padding"
            disabled={getSquatValue() === ''}
            selectOnFocus
          >
            <IonSegmentButton value="false">
              <IonLabel>{t('squat-HG')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="true">
              <IonLabel>{t('squat-barrass')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {checkIsReliabilityAnIssue() && <Alert title={checkIsReliabilityAnIssue()} className="top-margin" />}
        {isLengthBreadthRatioOutOfRange(state.vessel.general.lengthBPP, state.vessel.general.breadth, state.status.showBarrass) && (
          <Alert
            title={isLengthBreadthRatioOutOfRange(state.vessel.general.lengthBPP, state.vessel.general.breadth, state.status.showBarrass)}
            className="top-margin"
          />
        )}
        {isBreadthDraughtRatioOutOfRange(state.vessel.general.breadth, state.vessel.general.draught, state.status.showBarrass) && (
          <Alert
            title={isBreadthDraughtRatioOutOfRange(state.vessel.general.breadth, state.vessel.general.draught, state.status.showBarrass)}
            className="top-margin"
          />
        )}

        <SectionTitle title={t('squat')} hideValidity />
        <IonGrid className="no-padding">
          <IonRow className="input-row">
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('heel-due-wind')}
                value={(isNaN(state.calculations.squat.heelDueWind) ? '' : state.calculations.squat.heelDueWind).toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="°"
                unitId="deg"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('constant-heel-during-turn')}
                value={
                  isNaN(state.calculations.squat.constantHeelDuringTurn)
                    ? ''
                    : state.calculations.squat.constantHeelDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="°"
                unitId="deg"
                infoContentTitle={t('constant-heel-during-turn-info-title')}
                infoContent={<p>{t('constant-heel-during-turn-info')}</p>}
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('corrected-draught')}
                value={
                  isNaN(state.calculations.squat.correctedDraught)
                    ? ''
                    : state.calculations.squat.correctedDraught.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="m"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('corrected-draught-during-turn')}
                value={
                  isNaN(state.calculations.squat.correctedDraughtDuringTurn)
                    ? ''
                    : state.calculations.squat.correctedDraughtDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="m"
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('UKC-vessel-motions')}
                value={getUKCVesselMotionValue().toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="m"
                error={
                  isUKCShipMotionsUnderRequired(
                    state.environment.attribute.requiredUKC,
                    state.calculations.squat.UKCVesselMotions,
                    state.status.showBarrass
                  )
                    ? t('UKC-under-required-minimum')
                    : ''
                }
                infoContentTitle={t('vessel-motions-assumptions')}
                infoContent={
                  <>
                    <p>{t('vessel-motions-assumptions')}:</p>
                    <ul>
                      <li>{t('vessel-motions-assumption-1')}</li>
                      <li>{t('vessel-motions-assumption-2')}</li>
                      <li>{t('vessel-motions-assumption-3')}</li>
                    </ul>
                  </>
                }
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('UKC-straight-course')}
                value={getUKCStraightCourseValue().toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="m"
                error={
                  isUKCStraightUnderRequired(
                    state.environment.attribute.requiredUKC,
                    state.calculations.squat.UKCStraightCourse,
                    state.status.showBarrass
                  )
                    ? t('UKC-under-required-minimum')
                    : ''
                }
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('UKC-during-turn')}
                value={getUKCDuringTurnValue().toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="m"
                error={
                  isUKCDuringTurnUnderRequired(
                    state.environment.attribute.requiredUKC,
                    state.calculations.squat.UKCDuringTurn,
                    state.status.showBarrass
                  )
                    ? t('UKC-under-required-minimum')
                    : ''
                }
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('squat') + ', ' + tRoot(state.environment.fairway.fairwayForm?.name)}
                value={getSquatValue().toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="m"
                helper={printSquatHelper()}
              />
            </IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle title={t('wind-force')} hideValidity />
        <IonGrid className="no-padding">
          <IonRow className="input-row">
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('relative-wind-direction')}
                value={Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}
                unit="°"
                unitId="deg"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField title={t('relative-wind-speed')} value={Math.round(state.calculations.forces.relativeWindSpeed)} unit="m/s" />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('wind-force')}
                value={(isNaN(state.calculations.forces.windForce) ? '' : state.calculations.forces.windForce).toLocaleString(i18n.language, {
                  maximumFractionDigits: 1,
                })}
                unit="mt"
                infoContentTitle={t('wind-force-info-title')}
                infoContent={<p>{t('wind-force-info')}</p>}
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('wave-force')}
                value={(isNaN(state.calculations.forces.waveForce) ? '' : state.calculations.forces.waveForce).toLocaleString(i18n.language, {
                  maximumFractionDigits: 1,
                })}
                unit="mt"
                infoContentTitle={t('wave-force-info-title')}
                infoContent={<p>{t('wave-force-info')}</p>}
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('bow-thruster-force')}
                value={state.calculations.forces.bowThrusterForce.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
                unit="mt"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('remaining-safety-margin')}
                value={(isNaN(state.calculations.forces.remainingSafetyMargin)
                  ? ''
                  : state.calculations.forces.remainingSafetyMargin * 100
                ).toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
                unit="%"
                error={
                  isSafetyMarginInsufficient(state.environment.attribute.safetyMarginWindForce, state.calculations.forces.remainingSafetyMargin)
                    ? t('insufficient-safety-margin')
                    : ''
                }
              />
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="12">
              <LabelField
                title={t('minimum-external-force-required')}
                value={
                  state.calculations.forces.externalForceRequired > 0
                    ? state.calculations.forces.externalForceRequired.toLocaleString(i18n.language, { maximumFractionDigits: 1 })
                    : '-'
                }
                error={isExternalForceRequired(state.calculations.forces.externalForceRequired) ? t('external-force-required') : ''}
              />
            </IonCol>
            <IonCol size="6"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle title={t('drift')} hideValidity infoContentTitle={t('drift-info-title')} infoContent={<p>{t('drift-info')}</p>} />
        <IonGrid className="no-padding">
          <IonRow className="input-row">
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('relative-wind-direction')}
                value={Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}
                unit="°"
                unitId="deg"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField title={t('relative-wind-speed')} value={Math.round(state.calculations.forces.relativeWindSpeed)} unit="m/s" />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('estimated-drift-angle')}
                value={(isFinite(state.calculations.forces.estimatedDriftAngle)
                  ? toDeg(state.calculations.forces.estimatedDriftAngle)
                  : ''
                ).toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="°"
                unitId="deg"
              />
            </IonCol>
            <IonCol size="6" sizeSm="12" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('estimated-vessel-breadth-due-drift')}
                value={state.calculations.forces.estimatedBreadth.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="m"
              />
            </IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
            <IonCol size="6" className="hide-portrait"></IonCol>
          </IonRow>
        </IonGrid>
      </>
    </>
  );
};

export default Calculations;

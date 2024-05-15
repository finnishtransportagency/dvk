import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { IonText, IonGrid, IonRow, IonCol } from '@ionic/react';

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
} from '../utils/calculations';
import Modal from './Modal';
import SquatHeader from './SquatHeader';
import { isEmbedded } from '../pages/Home';
import CalculationOptions from './CalculationOptions';
import CalculationChecks from './CalculationChecks';
import SquatResults from './SquatResults';
import WindForceResults from './WindForceResults';
import DriftResults from './DriftResults';

const Calculations: React.FC = () => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squat.calculations' });
  const { state, dispatch } = useSquatContext();
  const {
    status: { showLimitedView: limitedView },
  } = state;

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
      state.environment.attribute.safetyMarginWindForce,
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
    const estimatedDriftAngle = calculateEstimatedDriftAngle({
      lengthBPP: state.vessel.general.lengthBPP,
      draught: state.vessel.general.draught,
      profileIndex: state.vessel.detailed.profileSelected.id - 1,
      vesselSpeed: state.environment.vessel.vesselSpeed,
      windSurface: state.vessel.detailed.windSurface,
      airDensity: state.environment.attribute.airDensity,
      waterDensity: state.environment.attribute.waterDensity,
      apparentWindAngleDrift,
      apparentWindVelocityDrift,
    });

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
    state.environment.attribute.safetyMarginWindForce,
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
    const [squatHG, squatHGListed] = calculateSquatHG({
      lengthBPP: state.vessel.general.lengthBPP,
      breadth: state.vessel.general.breadth,
      draught: state.vessel.general.draught,
      blockCoefficient: state.vessel.general.blockCoefficient,
      sweptDepth: state.environment.fairway.sweptDepth,
      waterLevel: state.environment.fairway.waterLevel,
      fairwayFormIndex: state.environment.fairway.fairwayForm.id - 1,
      channelWidth: state.environment.fairway.channelWidth,
      slopeScale: state.environment.fairway.slopeScale,
      slopeHeight: state.environment.fairway.slopeHeight,
      vesselSpeed: state.environment.vessel.vesselSpeed,
      draughtDuringTurn: correctedDraughtDuringTurn,
    });

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

  return (
    <>
      <div className={'pagebreak' + (limitedView ? ' hide-portrait' : '')}></div>
      <IonGrid className="ion-no-padding ion-no-margin">
        <IonRow>
          <IonCol size="auto" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <IonText color="dark" className="equal-margin-top">
              <SquatHeader level={2} text={t('title')} embedded={isEmbedded()}></SquatHeader>
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
              triggerClassName="no-background-focused"
            />
          </IonCol>
        </IonRow>
      </IonGrid>

      <CalculationChecks doChecks={['ukc']} />
      <CalculationOptions />
      <CalculationChecks doChecks={['reliability', 'LBratio', 'BDratio']} />

      <SquatResults limitedView={limitedView} />
      <WindForceResults limitedView={limitedView} />
      <DriftResults limitedView={limitedView} />
    </>
  );
};

export default Calculations;

import React, { useEffect } from 'react';
import './Squat.css';
import { useTranslation } from 'react-i18next';
import { IonText, IonItem, IonNote, IonButton, IonGrid, IonRow, IonCol, IonToggle, IonLabel } from '@ionic/react';

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
  toDeg,
} from '../utils/calculations';

import Alert from './Alert';
import SectionTitle from './SectionTitle';
import LabelField from './LabelField';
import {
  isExternalForceRequired,
  isSafetyMarginInsufficient,
  isUKCDuringTurnUnderRequired,
  isUKCShipMotionsUnderRequired,
  isUKCStraightUnderRequired,
  isUKCUnderMinimum,
} from '../utils/validations';

const Calculations: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useSquatContext();

  // Validations
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
  const setStateStatus = (key: string, value: boolean) => {
    dispatch({
      type: 'status',
      payload: { key: key, value: value, elType: 'boolean' },
    });
  };

  // Determine values to show
  const getUKCVesselMotionValue = () => {
    const currentValue = state.calculations.squat.UKCVesselMotions[state.status.showBarrass ? 0 : 1][state.status.showDeepWaterValues ? 1 : 0];
    return isNaN(currentValue) ? 0 : currentValue;
  };
  const getUKCStraightCourseValue = () => {
    const currentValue = state.calculations.squat.UKCStraightCourse[state.status.showBarrass ? 0 : 1];
    return isNaN(currentValue) ? '' : currentValue;
  };
  const getUKCDuringTurnValue = () => {
    const currentValue = state.calculations.squat.UKCDuringTurn[state.status.showBarrass ? 0 : 1];
    return isNaN(currentValue) ? '' : currentValue;
  };
  const getSquatValue = () => {
    const currentValue =
      state.status.showBarrass || checkIsUKCUnderMinimum() ? state.calculations.squat.squatBarrass : state.calculations.squat.squatHG;
    return isNaN(currentValue) ? '' : currentValue;
  };

  return (
    <>
      <IonText color="dark" className="equal-margin-top">
        <h2>
          <strong>{t('homePage.squat.calculations.title')}</strong>
        </h2>
      </IonText>

      <>
        {checkIsUKCUnderMinimum() && <Alert title={t('homePage.squat.calculations.UKC-under-required-minimum')} />}

        <IonNote>
          <IonButton size="small" shape="round" fill="outline" strong={true}>
            ?
          </IonButton>
        </IonNote>
        <IonItem lines="none" className="only-label">
          <IonGrid className="no-padding">
            <IonRow className="ion-align-items-center">
              <IonCol size="5">
                <IonLabel color={state.status.showDeepWaterValues ? 'medium' : 'primary'}>
                  {t('homePage.squat.calculations.shallow-water-values')}
                </IonLabel>
              </IonCol>
              <IonCol size="2" className="ion-justify-content-center use-flex">
                <IonToggle
                  checked={state.status.showDeepWaterValues}
                  onIonChange={(e) => setStateStatus('showDeepWaterValues', e.detail.checked)}
                  className="squat-toggle"
                  disabled={!state.environment.weather.waveLength[0]}
                />
              </IonCol>
              <IonCol size="5">
                <IonLabel color={state.status.showDeepWaterValues ? 'primary' : 'medium'} className="align-right">
                  {t('homePage.squat.calculations.deep-water-values')}
                </IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonItem>
        <IonItem lines="none" className="only-label">
          <IonGrid className="no-padding">
            <IonRow className="ion-align-items-center">
              <IonCol size="5">
                <IonLabel color={state.status.showBarrass ? 'medium' : 'primary'}>{t('homePage.squat.calculations.squat-HG')}</IonLabel>
              </IonCol>
              <IonCol size="2" className="ion-justify-content-center use-flex">
                <IonToggle
                  checked={state.status.showBarrass}
                  onIonChange={(e) => setStateStatus('showBarrass', e.detail.checked)}
                  className="squat-toggle"
                  disabled={getSquatValue() === ''}
                />
              </IonCol>
              <IonCol size="5">
                <IonLabel color={state.status.showBarrass ? 'primary' : 'medium'} className="align-right">
                  {t('homePage.squat.calculations.squat-barrass')}
                </IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonItem>

        <SectionTitle title={t('homePage.squat.calculations.squat')} hideValidity />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.heel-due-wind')}
                value={(isNaN(state.calculations.squat.heelDueWind) ? '' : state.calculations.squat.heelDueWind).toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="deg"
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.constant-heel-during-turn')}
                value={
                  isNaN(state.calculations.squat.constantHeelDuringTurn)
                    ? ''
                    : state.calculations.squat.constantHeelDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="deg"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.corrected-draught')}
                value={
                  isNaN(state.calculations.squat.correctedDraught)
                    ? ''
                    : state.calculations.squat.correctedDraught.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="m"
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.corrected-draught-during-turn')}
                value={
                  isNaN(state.calculations.squat.correctedDraughtDuringTurn)
                    ? ''
                    : state.calculations.squat.correctedDraughtDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="m"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.UKC-vessel-motions')}
                value={getUKCVesselMotionValue().toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="m"
                error={
                  isUKCShipMotionsUnderRequired(
                    state.environment.attribute.requiredUKC,
                    state.calculations.squat.UKCVesselMotions,
                    state.status.showBarrass
                  )
                    ? t('homePage.squat.calculations.UKC-under-required-minimum')
                    : ''
                }
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.UKC-straight-course')}
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
                    ? t('homePage.squat.calculations.UKC-under-required-minimum')
                    : ''
                }
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.UKC-during-turn')}
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
                    ? t('homePage.squat.calculations.UKC-under-required-minimum')
                    : ''
                }
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.squat') + ', ' + t(state.environment.fairway.fairwayForm?.name)}
                value={getSquatValue().toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="m"
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle title={t('homePage.squat.calculations.wind-force')} hideValidity />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.relative-wind-direction')}
                value={Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}
                unit="deg"
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.relative-wind-speed')}
                value={Math.round(state.calculations.forces.relativeWindSpeed)}
                unit="m/s"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.wind-force')}
                value={(isNaN(state.calculations.forces.windForce) ? '' : state.calculations.forces.windForce).toLocaleString(i18n.language, {
                  maximumFractionDigits: 1,
                })}
                unit={t('common.tonnes')}
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.wave-force')}
                value={(isNaN(state.calculations.forces.waveForce) ? '' : state.calculations.forces.waveForce).toLocaleString(i18n.language, {
                  maximumFractionDigits: 1,
                })}
                unit={t('common.tonnes')}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.bow-thruster-force')}
                value={state.calculations.forces.bowThrusterForce.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
                unit={t('common.tonnes')}
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.remaining-safety-margin')}
                value={(isNaN(state.calculations.forces.remainingSafetyMargin)
                  ? ''
                  : state.calculations.forces.remainingSafetyMargin * 100
                ).toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
                unit="%"
                error={
                  isSafetyMarginInsufficient(state.environment.attribute.safetyMarginWindForce, state.calculations.forces.remainingSafetyMargin)
                    ? t('homePage.squat.calculations.insufficient-safety-margin')
                    : ''
                }
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <LabelField
                title={t('homePage.squat.calculations.minimum-external-force-required')}
                value={
                  state.calculations.forces.externalForceRequired > 0
                    ? state.calculations.forces.externalForceRequired.toLocaleString(i18n.language, { maximumFractionDigits: 1 })
                    : '-'
                }
                error={
                  isExternalForceRequired(state.calculations.forces.externalForceRequired)
                    ? t('homePage.squat.calculations.external-force-required')
                    : ''
                }
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle title={t('homePage.squat.calculations.drift')} hideValidity />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.relative-wind-direction')}
                value={Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}
                unit="deg"
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.relative-wind-speed')}
                value={Math.round(state.calculations.forces.relativeWindSpeed)}
                unit="m/s"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.estimated-drift-angle')}
                value={(isFinite(state.calculations.forces.estimatedDriftAngle)
                  ? toDeg(state.calculations.forces.estimatedDriftAngle)
                  : ''
                ).toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="deg"
              />
            </IonCol>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.calculations.estimated-vessel-breadth-due-drift')}
                value={state.calculations.forces.estimatedBreadth.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="m"
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </>
    </>
  );
};

export default Calculations;

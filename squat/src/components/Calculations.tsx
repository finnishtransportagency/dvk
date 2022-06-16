import React, { useEffect, useState } from 'react';
import './Squat.css';
import { useTranslation } from 'react-i18next';
import {
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonAccordionGroup,
  IonNote,
  IonButton,
  IonAccordion,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';

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

import { warningOutline } from 'ionicons/icons';

// Declare computation result types and initial values
type WindForceAndDriftResult = {
  relativeWindDirection: number;
  relativeWindSpeed: number;
  windForce: number;
  waveForce: number;
  bowThrusterForce: number;
  remainingSafetyMargin: number;
  externalForceRequired: number;
  estimatedDriftAngle: number;
  estimatedBreadth: number;
};
type SquatResult = {
  heelDueWind: number;
  constantHeelDuringTurn: number;
  correctedDraught: number;
  correctedDraughtDuringTurn: number;
  UKCVesselMotions: number[][];
  UKCStraightCourse: number[];
  UKCDuringTurn: number[];
  squatBarrass: number;
  squatHG: number;
  squatHGListed: number;
};

const initialWindForceAndDriftResult = {
  relativeWindDirection: 0,
  relativeWindSpeed: 0,
  windForce: 0,
  waveForce: 0,
  bowThrusterForce: 0,
  remainingSafetyMargin: 0,
  externalForceRequired: 0,
  estimatedDriftAngle: 0,
  estimatedBreadth: 0,
};
const initialSquatResult = {
  heelDueWind: 0,
  constantHeelDuringTurn: 0,
  correctedDraught: 0,
  correctedDraughtDuringTurn: 0,
  UKCVesselMotions: [
    [0, 0],
    [0, 0],
  ],
  UKCStraightCourse: [0, 0],
  UKCDuringTurn: [0, 0],
  squatBarrass: 0,
  squatHG: 0,
  squatHGListed: 0,
};

const Calculations: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state } = useSquatContext();

  const [windForceAndDriftResult, setWindForceAndDriftResult] = useState<WindForceAndDriftResult>(initialWindForceAndDriftResult);
  const [squatResult, setSquatResult] = useState<SquatResult>(initialSquatResult);

  const [showBarrass, setShowBarrass] = useState<boolean>(false);

  const toggleSquat = (value: boolean) => {
    setShowBarrass(value);
  };

  // Validations
  const isUKCUnderMinimum = () => {
    // If(IsBlank(Swept_Depth), false,
    // If(Value(UKC_During_Turn.Text) < Value(Required_UKC.Text), true, If(Value(UKC_Straight.Text) < Value(Required_UKC.Text), true, If(Value(UKC_Ship_Motions.Text) < Value(Required_UKC.Text), true, false))))
    if (!state.environment.fairway.sweptDepth) {
      return false;
    }
    if (
      (showBarrass ? squatResult.UKCDuringTurn[0] : squatResult.UKCDuringTurn[1]) < state.environment.attribute.requiredUKC ||
      (showBarrass ? squatResult.UKCStraightCourse[0] : squatResult.UKCStraightCourse[1]) < state.environment.attribute.requiredUKC ||
      (showBarrass ? squatResult.UKCVesselMotions[0][0] : squatResult.UKCVesselMotions[0][1]) < state.environment.attribute.requiredUKC
    ) {
      return true;
    }
    return false;
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

    // Update wind/wave force and drift results
    setWindForceAndDriftResult({
      relativeWindDirection: apparentWindAngleDrift,
      relativeWindSpeed: apparentWindVelocityDrift,
      windForce: isNaN(windForce) ? 0 : windForce,
      waveForce: isNaN(waveForce) ? 0 : waveForce,
      bowThrusterForce: bowThrusterForce,
      remainingSafetyMargin: isNaN(remainingSafetyMargin) ? 0 : remainingSafetyMargin,
      externalForceRequired: minExternalForce,
      estimatedDriftAngle: isFinite(estimatedDriftAngle) ? toDeg(estimatedDriftAngle) : 0,
      estimatedBreadth: estimatedBreadth,
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
      windForceAndDriftResult.windForce
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

    // Update squat results
    // TODO: Handle NaN-check in view?
    setSquatResult({
      heelDueWind: isNaN(heelDueWind) ? 0 : heelDueWind,
      constantHeelDuringTurn: isNaN(constantHeelDuringTurn) ? 0 : constantHeelDuringTurn,
      correctedDraught: isNaN(correctedDraught) ? 0 : correctedDraught,
      correctedDraughtDuringTurn: isNaN(correctedDraughtDuringTurn) ? 0 : correctedDraughtDuringTurn,
      UKCVesselMotions: [UKCVesselMotionBarrass, UKCVesselMotionHG],
      UKCStraightCourse: [isNaN(UKCStraightCourseBarrass) ? 0 : UKCStraightCourseBarrass, isNaN(UKCStraightCourseHG) ? 0 : UKCStraightCourseHG],
      UKCDuringTurn: [isNaN(UKCDuringTurnBarrass) ? 0 : UKCDuringTurnBarrass, isNaN(UKCDuringTurnHG) ? 0 : UKCDuringTurnHG],
      squatBarrass: isNaN(squatBarrass) ? 0 : squatBarrass,
      squatHG: isNaN(squatHG) ? 0 : squatHG,
      squatHGListed: isNaN(squatHGListed) ? 0 : squatHGListed, // TODO: remove if not needed
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
    windForceAndDriftResult.windForce,
  ]);

  return (
    <IonCard color="secondary">
      <IonCardHeader>
        <IonCardSubtitle>{t('homePage.squat.calculations.description')}</IonCardSubtitle>
        <IonCardTitle>{t('homePage.squat.calculations.title')}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        {isUKCUnderMinimum() && (
          <IonGrid className="danger">
            <IonRow className="ion-align-items-center">
              <IonCol size="auto">
                <IonIcon size="large" icon={warningOutline} />
              </IonCol>
              <IonCol>
                <IonText>{t('homePage.squat.calculations.UKC-under-required-minimum')}</IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        <IonAccordionGroup>
          <IonAccordion value="windforce">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.calculations.wind-force')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.relative-wind-direction')} (deg)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{Math.round(windForceAndDriftResult.relativeWindDirection ? windForceAndDriftResult.relativeWindDirection : 0)}&deg;</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.relative-wind-speed')} (m/s)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{Math.round(windForceAndDriftResult.relativeWindSpeed)} m/s</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>
                    {t('homePage.squat.calculations.wind-force')} ({t('common.tonnes')})
                  </small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{windForceAndDriftResult.windForce.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>
                    {t('homePage.squat.calculations.wave-force')} ({t('common.tonnes')})
                  </small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{windForceAndDriftResult.waveForce.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>
                    {t('homePage.squat.calculations.bow-thruster-force')} ({t('common.tonnes')})
                  </small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{windForceAndDriftResult.bowThrusterForce.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.remaining-safety-margin')}</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{windForceAndDriftResult.remainingSafetyMargin.toLocaleString(i18n.language, { maximumFractionDigits: 1 })} %</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.minimum-external-force-required')}</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>
                      {windForceAndDriftResult.externalForceRequired > 0
                        ? windForceAndDriftResult.externalForceRequired.toLocaleString(i18n.language, { maximumFractionDigits: 1 })
                        : '-'}
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="squat">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.calculations.squat')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.heel-due-wind')} (deg)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{squatResult.heelDueWind.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}&deg;</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.constant-heel-during-turn')} (deg)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{squatResult.constantHeelDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}&deg;</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.corrected-draught')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{squatResult.correctedDraught.toLocaleString(i18n.language, { maximumFractionDigits: 2 })} m</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.corrected-draught-during-turn')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{squatResult.correctedDraughtDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })} m</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonButton size="small">{t('homePage.squat.calculations.deep-water-values')}</IonButton>
                <IonNote slot="end">
                  <IonButton size="small" shape="round" fill="outline" strong={true}>
                    ?
                  </IonButton>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.UKC-vessel-motions')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{squatResult.UKCVesselMotions[showBarrass ? 0 : 1][0].toLocaleString(i18n.language, { maximumFractionDigits: 2 })} m</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.UKC-straight-course')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>
                      {(showBarrass ? squatResult.UKCStraightCourse[0] : squatResult.UKCStraightCourse[1]).toLocaleString(i18n.language, {
                        maximumFractionDigits: 2,
                      })}{' '}
                      m
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.UKC-during-turn')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>
                      {(showBarrass ? squatResult.UKCDuringTurn[0] : squatResult.UKCDuringTurn[1]).toLocaleString(i18n.language, {
                        maximumFractionDigits: 2,
                      })}{' '}
                      m
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              {state.environment.fairway.fairwayForm && (
                <IonItem>
                  <div>
                    <IonLabel position="stacked">
                      {t('homePage.squat.calculations.squat')}, {t(state.environment.fairway.fairwayForm.name)} (m)
                    </IonLabel>
                  </div>
                  <IonLabel>
                    {(showBarrass || isUKCUnderMinimum() ? squatResult.squatBarrass : squatResult.squatHG).toLocaleString(i18n.language, {
                      maximumFractionDigits: 2,
                    })}{' '}
                    m
                  </IonLabel>
                  <IonNote slot="end">
                    <IonButton
                      size="small"
                      shape="round"
                      fill="outline"
                      strong={true}
                      title={t('homePage.squat.calculations.show-barrass-value')}
                      onPointerDown={() => toggleSquat(true)}
                      onPointerUp={() => toggleSquat(false)}
                    >
                      ?
                    </IonButton>
                  </IonNote>
                </IonItem>
              )}
            </IonList>
          </IonAccordion>
          <IonAccordion value="drift">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.calculations.drift')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.relative-wind-direction')} (deg)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{Math.round(windForceAndDriftResult.relativeWindDirection ? windForceAndDriftResult.relativeWindDirection : 0)}&deg;</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.relative-wind-speed')} (m/s)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{Math.round(windForceAndDriftResult.relativeWindSpeed)} m/s</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.estimated-drift-angle')} (deg)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{windForceAndDriftResult.estimatedDriftAngle.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}&deg;</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.estimated-vessel-breadth-due-drift')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{windForceAndDriftResult.estimatedBreadth.toLocaleString(i18n.language, { maximumFractionDigits: 2 })} m</h4>
                  </IonText>
                </IonNote>
              </IonItem>
            </IonList>
          </IonAccordion>
        </IonAccordionGroup>
      </IonCardContent>
    </IonCard>
  );
};

export default Calculations;

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

import { warningOutline, alertCircleOutline } from 'ionicons/icons';

const Calculations: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useSquatContext();

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
      (showBarrass ? state.calculations.squat.UKCDuringTurn[0] : state.calculations.squat.UKCDuringTurn[1]) <
        state.environment.attribute.requiredUKC ||
      (showBarrass ? state.calculations.squat.UKCStraightCourse[0] : state.calculations.squat.UKCStraightCourse[1]) <
        state.environment.attribute.requiredUKC ||
      (showBarrass ? state.calculations.squat.UKCVesselMotions[0][0] : state.calculations.squat.UKCVesselMotions[0][1]) <
        state.environment.attribute.requiredUKC
    ) {
      return true;
    }
    return false;
  };

  // Field validations
  const isSafetyMarginInsufficient = () => {
    // If(Value(Remaining_Safety_Margin.Text) < Set_Safety_Margin.Value/100, 5, 0)
    return state.calculations.forces.remainingSafetyMargin < state.environment.attribute.safetyMarginWindForce / 100;
  };
  const isExternalForceRequired = () => {
    // If(Value(Minimum_Force_Required.Text) > 0, 5, 0)
    return state.calculations.forces.externalForceRequired > 0;
  };
  const isUKCShipMotionsUnderRequired = () => {
    // If(Value(UKC_Ship_Motions.Text) < Value(Required_UKC.Text), 5, 0)
    return state.calculations.squat.UKCVesselMotions[showBarrass ? 0 : 1][0] < state.environment.attribute.requiredUKC;
  };
  const isUKCStraightUnderRequired = () => {
    // If(Value(UKC_Straight.Text) < Value(Required_UKC.Text), 5, 0)
    return state.calculations.squat.UKCStraightCourse[showBarrass ? 0 : 1] < state.environment.attribute.requiredUKC;
  };
  const isUKCDuringTurnUnderRequired = () => {
    // If(Value(UKC_During_Turn.Text) < Value(Required_UKC.Text), 5, 0)
    return state.calculations.squat.UKCDuringTurn[showBarrass ? 0 : 1] < state.environment.attribute.requiredUKC;
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
              <IonCol size="auto" className="icon">
                <IonIcon icon={warningOutline} color="danger" />
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
                    <h4>{Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}&deg;</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.relative-wind-speed')} (m/s)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{Math.round(state.calculations.forces.relativeWindSpeed)} m/s</h4>
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
                    <h4>
                      {(isNaN(state.calculations.forces.windForce) ? '' : state.calculations.forces.windForce).toLocaleString(i18n.language, {
                        maximumFractionDigits: 1,
                      })}
                    </h4>
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
                    <h4>
                      {(isNaN(state.calculations.forces.waveForce) ? '' : state.calculations.forces.waveForce).toLocaleString(i18n.language, {
                        maximumFractionDigits: 1,
                      })}
                    </h4>
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
                    <h4>{state.calculations.forces.bowThrusterForce.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.remaining-safety-margin')}</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText color={isSafetyMarginInsufficient() ? 'danger' : ''}>
                    {isSafetyMarginInsufficient() && (
                      <div title={t('homePage.squat.calculations.insufficient-safety-margin')}>
                        <IonIcon icon={alertCircleOutline} color="danger" size="small" />
                      </div>
                    )}
                    <h4>
                      {(isNaN(state.calculations.forces.remainingSafetyMargin)
                        ? ''
                        : state.calculations.forces.remainingSafetyMargin * 100
                      ).toLocaleString(i18n.language, { maximumFractionDigits: 1 })}{' '}
                      %
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.minimum-external-force-required')}</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText color={isExternalForceRequired() ? 'danger' : ''}>
                    {isExternalForceRequired() && (
                      <div title={t('homePage.squat.calculations.external-force-required')}>
                        <IonIcon icon={alertCircleOutline} color="danger" size="small" />
                      </div>
                    )}
                    <h4>
                      {state.calculations.forces.externalForceRequired > 0
                        ? state.calculations.forces.externalForceRequired.toLocaleString(i18n.language, { maximumFractionDigits: 1 })
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
                    <h4>
                      {(isNaN(state.calculations.squat.heelDueWind) ? '' : state.calculations.squat.heelDueWind).toLocaleString(i18n.language, {
                        maximumFractionDigits: 2,
                      })}
                      &deg;
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.constant-heel-during-turn')} (deg)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>
                      {isNaN(state.calculations.squat.constantHeelDuringTurn)
                        ? ''
                        : state.calculations.squat.constantHeelDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                      &deg;
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.corrected-draught')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>
                      {isNaN(state.calculations.squat.correctedDraught)
                        ? ''
                        : state.calculations.squat.correctedDraught.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}{' '}
                      m
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.corrected-draught-during-turn')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>
                      {isNaN(state.calculations.squat.correctedDraughtDuringTurn)
                        ? ''
                        : state.calculations.squat.correctedDraughtDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}{' '}
                      m
                    </h4>
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
                  <IonText color={isUKCShipMotionsUnderRequired() ? 'danger' : ''}>
                    {isUKCShipMotionsUnderRequired() && (
                      <div title={t('homePage.squat.calculations.UKC-under-required-minimum')}>
                        <IonIcon icon={alertCircleOutline} color="danger" size="small" />
                      </div>
                    )}
                    <h4>
                      {(isNaN(state.calculations.squat.UKCVesselMotions[showBarrass ? 0 : 1][0])
                        ? 0
                        : state.calculations.squat.UKCVesselMotions[showBarrass ? 0 : 1][0]
                      ).toLocaleString(i18n.language, { maximumFractionDigits: 2 })}{' '}
                      m
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.UKC-straight-course')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText color={isUKCStraightUnderRequired() ? 'danger' : ''}>
                    {isUKCStraightUnderRequired() && (
                      <div title={t('homePage.squat.calculations.UKC-under-required-minimum')}>
                        <IonIcon icon={alertCircleOutline} color="danger" size="small" />
                      </div>
                    )}
                    <h4>
                      {isNaN(showBarrass ? state.calculations.squat.UKCStraightCourse[0] : state.calculations.squat.UKCStraightCourse[1])
                        ? ''
                        : (showBarrass
                            ? state.calculations.squat.UKCStraightCourse[0]
                            : state.calculations.squat.UKCStraightCourse[1]
                          ).toLocaleString(i18n.language, {
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
                  <IonText color={isUKCDuringTurnUnderRequired() ? 'danger' : ''}>
                    {isUKCDuringTurnUnderRequired() && (
                      <div title={t('homePage.squat.calculations.UKC-under-required-minimum')}>
                        <IonIcon icon={alertCircleOutline} color="danger" size="small" />
                      </div>
                    )}
                    <h4>
                      {isNaN(showBarrass ? state.calculations.squat.UKCDuringTurn[0] : state.calculations.squat.UKCDuringTurn[1])
                        ? ''
                        : (showBarrass ? state.calculations.squat.UKCDuringTurn[0] : state.calculations.squat.UKCDuringTurn[1]).toLocaleString(
                            i18n.language,
                            {
                              maximumFractionDigits: 2,
                            }
                          )}{' '}
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
                    {isNaN(showBarrass || isUKCUnderMinimum() ? state.calculations.squat.squatBarrass : state.calculations.squat.squatHG)
                      ? ''
                      : (showBarrass || isUKCUnderMinimum()
                          ? state.calculations.squat.squatBarrass
                          : state.calculations.squat.squatHG
                        ).toLocaleString(i18n.language, {
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
                    <h4>{Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}&deg;</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.relative-wind-speed')} (m/s)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{Math.round(state.calculations.forces.relativeWindSpeed)} m/s</h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.estimated-drift-angle')} (deg)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>
                      {(isFinite(state.calculations.forces.estimatedDriftAngle)
                        ? toDeg(state.calculations.forces.estimatedDriftAngle)
                        : ''
                      ).toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                      &deg;
                    </h4>
                  </IonText>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <small>{t('homePage.squat.calculations.estimated-vessel-breadth-due-drift')} (m)</small>
                </IonLabel>
                <IonNote slot="end">
                  <IonText>
                    <h4>{state.calculations.forces.estimatedBreadth.toLocaleString(i18n.language, { maximumFractionDigits: 2 })} m</h4>
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

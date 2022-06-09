import React, { useEffect, useRef, useState } from 'react';
import './Squat.css';
import { useTranslation } from "react-i18next";
import { IonText, IonList, IonItem, IonLabel, IonAccordionGroup, IonNote, IonButton, IonAccordion, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import { State } from '../hooks/squatReducer';

interface ContainerProps { }

// Declare constants for calculations
const DRAG_COEFFICIENT: number = 1.14;
const DRIFT_COEFFICIENTS: Array<Array<number>> = [
  [0,0.012,0.009,0.009,0.022,0.027,0.036,0.045,0.057,0.072,0.089,0.109,0.136,0.162,0.173,0.156,0.119,0.074,0],
  [0,0.026,0.045,0.055,0.067,0.072,0.046,0.031,0.019,0.011,0.032,0.048,0.066,0.09,0.099,0.087,0.065,0.033,0],
  [0,0.023,0.041,0.049,0.072,0.066,0.02,0.009,0.012,0.033,0.059,0.089,0.103,0.117,0.14,0.111,0.08,0.05,0],
  [0,0.013,0.025,0.03,0.032,0.031,0.029,0.015,0.005,0.022,0.041,0.059,0.073,0.081,0.089,0.075,0.053,0.024,0]
];

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
}
type SquatResult = {
  heelDueWind: number;
  constantHeelDuringTurn: number;
  correctedDraught: number;
  UKCVesselMotions: number;
  UKCStraightCourse: number;
  UKCDuringTurn: number;
  squat: number;
}

const initialWindForceAndDriftResult = {
  relativeWindDirection: 0,
  relativeWindSpeed: 0,
  windForce: 0,
  waveForce: 0,
  bowThrusterForce: 0,
  remainingSafetyMargin: 0,
  externalForceRequired: 0,
  estimatedDriftAngle: 0,
  estimatedBreadth: 0
}
const initialSquatResult = {
  heelDueWind: 0,
  constantHeelDuringTurn: 0,
  correctedDraught: 0,
  UKCVesselMotions: 0,
  UKCStraightCourse: 0,
  UKCDuringTurn: 0,
  squat: 0
}

const Calculations: React.FC<ContainerProps> = () => {
  const { t, i18n } = useTranslation();
  const { state } = useSquatContext();

  const [windForceAndDriftResult, setWindForceAndDriftResult] = useState<WindForceAndDriftResult>(initialWindForceAndDriftResult);
  const [squatResult, setSquatResult] = useState<SquatResult>(initialSquatResult);

  const prevStateRef = useRef<State>();

  // useEffect to calculate results by input data update
  useEffect(() => {
    // 1. Wind Force & 3. Drift
    if (state.vessel.general.lengthBPP !== prevStateRef.current?.vessel.general.lengthBPP ||
        state.vessel.general.draught !== prevStateRef.current?.vessel.general.draught ||
        state.vessel.detailed.windSurface !== prevStateRef.current?.vessel.detailed.windSurface ||
        state.vessel.detailed.bowThruster !== prevStateRef.current?.vessel.detailed.bowThruster ||
        state.vessel.detailed.bowThrusterEfficiency !== prevStateRef.current?.vessel.detailed.bowThrusterEfficiency ||
        state.vessel.detailed.profileSelected !== prevStateRef.current?.vessel.detailed.profileSelected ||
        state.environment.weather.windSpeed !== prevStateRef.current?.environment.weather.windSpeed ||
        state.environment.weather.windDirection !== prevStateRef.current?.environment.weather.windDirection ||
        state.environment.weather.waveHeight !== prevStateRef.current?.environment.weather.waveHeight ||
        state.environment.vessel.vesselSpeed !== prevStateRef.current?.environment.vessel.vesselSpeed ||
        state.environment.vessel.vesselCourse !== prevStateRef.current?.environment.vessel.vesselCourse ||
        state.environment.attribute.airDensity !== prevStateRef.current?.environment.attribute.airDensity ||
        state.environment.attribute.waterDensity !== prevStateRef.current?.environment.attribute.waterDensity) {
      // 1.1 Relative Wind Speed & Direction
      console.info("Calculating relative wind properties...");
      var vesselSpeedMS = state.environment.vessel.vesselSpeed * 1.852 / 3.6;
      var angleDiff = state.environment.vessel.vesselCourse - state.environment.weather.windDirection;
      var windAngleDriftRAD = Math.abs(angleDiff) * Math.PI / 180;
      if (Math.abs(angleDiff) > 180) {
        windAngleDriftRAD = Math.abs(angleDiff + 360) * Math.PI / 180;
      }
      // Sqrt(Wind_Speed_Drift_Cal*Wind_Speed_Drift_Cal+Ship_Speed_Drift_Cal*Ship_Speed_Drift_Cal+2*Wind_Speed_Drift_Cal*Ship_Speed_Drift_Cal*Cos(Wind_Angle_Rad_Drift_Cal))
      var apparentWindVelocityDrift = Math.sqrt(Math.pow(state.environment.weather.windSpeed, 2) + Math.pow(vesselSpeedMS, 2) + 2 * state.environment.weather.windSpeed * vesselSpeedMS * Math.cos(windAngleDriftRAD));
      // Acos((Wind_Speed_Drift_Cal*Cos(Wind_Angle_Rad_Drift_Cal)+Ship_Speed_Drift_Cal)/Apparent_Wind_Velocity_Drift_Cal)
      var apparentWindAngleDrift = Math.acos((state.environment.weather.windSpeed * Math.cos(windAngleDriftRAD) + vesselSpeedMS) / apparentWindVelocityDrift) * 180 / Math.PI;

      // 1.2 Wind Force
      console.info("Calculating wind force...");
      // 0.5*Set_Density_Air/10*Set_Wind_Speed*Set_Wind_Speed*Abs(Total_Lateral_Surface_Area)/9.80665*1.14/1000*Sin(Radians(Apparent_Wind_Angle_Deg))
      var windForce = 0.5 * state.environment.attribute.airDensity * Math.pow(state.environment.weather.windSpeed, 2) * Math.abs(state.vessel.detailed.windSurface) / 9.80665 * DRAG_COEFFICIENT / 1000 * Math.sin(apparentWindAngleDrift * Math.PI / 180);

      // 1.3 Wave Force
      console.info("Calculating wave force...");
      // 0.35*Set_Density_Water*0.25*Length_BPP*(Set_Wave_Height/10)*(Set_Wave_Height/10)/1000*Sin(Radians(Apparent_Wind_Angle_Deg))
      var waveForce = 0.35 * state.environment.attribute.waterDensity * 0.25 * state.vessel.general.lengthBPP * Math.pow(state.environment.weather.waveHeight, 2) / 1000 * Math.sin(apparentWindAngleDrift * Math.PI / 180);
      
      // 1.4 Bow Thruster Force
      console.info("Calculating bow thruster force...");
      // (Bow_Thruster*1.34/100)*Set_Bow_Thruster_Efficiency.Value*25/100
      var bowThrusterForce = state.vessel.detailed.bowThruster * 1.34 / 100 * state.vessel.detailed.bowThrusterEfficiency;

      // 1.5 Remaining Safety Margin
      console.info("Calculating remaining safety margin...");
      // (((Bow_Thruster_Force*2)-(Wind_Force+Wave_Force))/Bow_Thruster_Force)*100
      var remainingSafetyMargin = (((bowThrusterForce * 2) - (windForce + waveForce)) / bowThrusterForce) * 100;

      // 1.6 Minimum External Force Required
      console.info("Calculating minimum external force required...");
      // If(Bow_Thruster_Force*2 >= Wind_Force+Wave_Force, "-", (Wind_Force+Wave_Force)-Bow_Thruster_Force*2)
      var minExternalForce = 0;
      if (bowThrusterForce * 2 < (windForce + waveForce)) {
        minExternalForce = (windForce + waveForce) - bowThrusterForce * 2;
      }

      // 3.0 Initialize drift index
      var driftIndex = 0;
      switch (true) {
        case apparentWindAngleDrift <= 10:
          break;
        case apparentWindAngleDrift <= 20:
          driftIndex = 1;
          break;
        case apparentWindAngleDrift <= 30:
          driftIndex = 2;
          break;
        case apparentWindAngleDrift <= 40:
          driftIndex = 3;
          break;
        case apparentWindAngleDrift <= 50:
          driftIndex = 4;
          break;
        case apparentWindAngleDrift <= 60:
          driftIndex = 5;
          break;
        case apparentWindAngleDrift <= 70:
          driftIndex = 6;
          break;
        case apparentWindAngleDrift <= 80:
          driftIndex = 7;
          break;
        case apparentWindAngleDrift <= 90:
          driftIndex = 8;
          break;
        case apparentWindAngleDrift <= 100:
          driftIndex = 9;
          break;
        case apparentWindAngleDrift < 110:
          driftIndex = 10;
          break;
        case apparentWindAngleDrift < 120:
          driftIndex = 11;
          break;
        case apparentWindAngleDrift < 130:
          driftIndex = 12;
          break;
        case apparentWindAngleDrift < 140:
          driftIndex = 13;
          break;
        case apparentWindAngleDrift < 150:
          driftIndex = 14;
          break;
        case apparentWindAngleDrift < 160:
          driftIndex = 15;
          break;
        case apparentWindAngleDrift <= 170:
          driftIndex = 16;
          break;
        default:
          driftIndex = 17;
          break;
      }

      // 3.1 Calculate drift value for current vessel type
      // ((Apparent_Wind_Angle_Deg-(Nro_Drift_Cal_1*10))*(('Cn_ Bulker_Drift_Cal_20'-'Cn_ Bulker_Drift_Cal_19')/10)) + 'Cn_ Bulker_Drift_Cal_19'
      var driftCoefficient = ((apparentWindAngleDrift - (driftIndex * 10)) * ((DRIFT_COEFFICIENTS[state.vessel.detailed.profileSelected.id-1][driftIndex+1]
        - DRIFT_COEFFICIENTS[state.vessel.detailed.profileSelected.id-1][driftIndex]) / 10)) + DRIFT_COEFFICIENTS[state.vessel.detailed.profileSelected.id-1][driftIndex];
      // (Air_Density_Drift_Cal/Sea_Density_Drift_Cal)*((Apparent_Wind_Velocity_Drift_Cal/Ship_Speed_Drift_Cal)*(Apparent_Wind_Velocity_Drift_Cal/Ship_Speed_Drift_Cal))
      // *(Total_Lateral_Surface_Area_Drift_Cal /((Vessel_Draught_Drift_Cal*Vessel_Draught_Drift_Cal))*Cn_Drift_Cal)/ (Pi()*(0.5+(2.4*Vessel_Draught_Drift_Cal/'Length_ BPP_Drift_Cal')))
      var estimatedDriftAngle = (state.environment.attribute.airDensity / state.environment.attribute.waterDensity) * Math.pow(apparentWindVelocityDrift / vesselSpeedMS, 2)
        * (Math.abs(state.vessel.detailed.windSurface) / (Math.pow(state.vessel.general.draught, 2)) * driftCoefficient) / (Math.PI * (0.5 + (2.4 * state.vessel.general.draught / state.vessel.general.lengthBPP)));

      // 3.2 Estimated breadth due to drift
      // Length_BPP*Sin(Drift_Angle_Drift_Cal)+Breadth
      var estimatedDriftBreadth = state.vessel.general.lengthBPP * Math.sin(estimatedDriftAngle);
      var estimatedBreadth = (isNaN(estimatedDriftBreadth)? 0 : estimatedDriftBreadth) + parseFloat(state.vessel.general.breadth.toString());

      // Update wind/wave force and drift results
      setWindForceAndDriftResult(
        {
          ...windForceAndDriftResult,
          relativeWindDirection: apparentWindAngleDrift,
          relativeWindSpeed: apparentWindVelocityDrift,
          windForce: isNaN(windForce)? 0 : windForce,
          waveForce: isNaN(waveForce)? 0 : waveForce,
          bowThrusterForce: bowThrusterForce,
          remainingSafetyMargin: isNaN(remainingSafetyMargin)? 0 : remainingSafetyMargin,
          externalForceRequired: minExternalForce,
          estimatedDriftAngle: isFinite(estimatedDriftAngle)? (estimatedDriftAngle * 180 / Math.PI) : 0,
          estimatedBreadth: estimatedBreadth
        }
      );
    }

    // Update previous state to current one
    prevStateRef.current = state;
  }, [state]);


  /*
  // x. Misc
  useEffect(() => {
    //console.log("Calculating vessel speed by two different methods...");
    //console.log("1: "+state.environment.vessel.vesselSpeed*0.514442986856, "2: "+state.environment.vessel.vesselSpeed*1.852/3.6);
  }, [state.environment.vessel.vesselSpeed]);

  useEffect(() => {
    // kg/m^3 * m^2/s^2 * m^2 = (kg * m^4) / m^3 * s^2 = kg*m/s^2 = N
    var F_wind = (state.environment.attribute.airDensity * Math.pow(state.environment.weather.windSpeed, 2) * state.vessel.detailed.windSurface * dragCoefficient) / 2 / 1000;
    console.log(`F_wind = ${F_wind} N`);
    //setWindForce(F_wind);
  }, [state.environment.attribute.airDensity, state.environment.weather.windSpeed, state.vessel.detailed.windSurface]);
  */

  return (
    <IonCard color="secondary">
      <IonCardHeader>
        <IonCardSubtitle>{t("homePage.squat.calculations.description")}</IonCardSubtitle>
        <IonCardTitle>{t("homePage.squat.calculations.title")}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <IonAccordionGroup>
          <IonAccordion value="windforce">
            <IonItem slot="header">
              <IonLabel>{t("homePage.squat.calculations.wind-force")}</IonLabel>
            </IonItem>
    
            <IonList slot="content">
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.relative-wind-direction")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{Math.round(windForceAndDriftResult.relativeWindDirection? windForceAndDriftResult.relativeWindDirection : 0)}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.relative-wind-speed")} (m/s)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{Math.round(windForceAndDriftResult.relativeWindSpeed)} m/s</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.wind-force")} ({t("common.tonnes")})</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{windForceAndDriftResult.windForce.toLocaleString(i18n.language, {maximumFractionDigits: 1})}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.wave-force")} ({t("common.tonnes")})</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{windForceAndDriftResult.waveForce.toLocaleString(i18n.language, {maximumFractionDigits: 1})}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.bow-thruster-force")} ({t("common.tonnes")})</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{windForceAndDriftResult.bowThrusterForce.toLocaleString(i18n.language, {maximumFractionDigits: 1})}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.remaining-safety-margin")}</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{windForceAndDriftResult.remainingSafetyMargin.toLocaleString(i18n.language, {maximumFractionDigits: 1})} %</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.minimum-external-force-required")}</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{windForceAndDriftResult.externalForceRequired > 0? windForceAndDriftResult.externalForceRequired.toLocaleString(i18n.language, {maximumFractionDigits: 1}) : "-"}</h4></IonText></IonNote>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="squat">
            <IonItem slot="header">
              <IonLabel>{t("homePage.squat.calculations.squat")}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.heel-due-wind")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{squatResult.heelDueWind}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.constant-heel-during-turn")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{squatResult.constantHeelDuringTurn}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.corrected-draught")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{squatResult.correctedDraught} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel color="danger"><small>Corrected Draught (m) ???</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{squatResult.correctedDraught} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonButton size="small">{t("homePage.squat.calculations.deep-water-values")}</IonButton>
                <IonNote slot="end">
                <IonButton size="small" shape="round" fill="outline" strong={true}>
                    ?
                </IonButton>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.UKC-vessel-motions")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{squatResult.UKCVesselMotions} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.UKC-straight-course")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{(squatResult.UKCStraightCourse).toLocaleString(i18n.language, {maximumFractionDigits: 2})} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.UKC-during-turn")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{squatResult.UKCDuringTurn} m</h4></IonText></IonNote>
              </IonItem>
              {state.environment.fairway.fairwayForm &&
                <IonItem>
                  <IonLabel><small>{t("homePage.squat.calculations.squat")}, {t(state.environment.fairway.fairwayForm.name)} (m)</small></IonLabel>
                  <IonNote slot="end"><IonText><h4>{(squatResult.squat).toLocaleString(i18n.language, {maximumFractionDigits: 2})} m</h4></IonText></IonNote>
                </IonItem>
              }
            </IonList>
          </IonAccordion>
          <IonAccordion value="drift">
            <IonItem slot="header">
              <IonLabel>{t("homePage.squat.calculations.drift")}</IonLabel>
            </IonItem>
      
            <IonList slot="content">
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.relative-wind-direction")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{Math.round(windForceAndDriftResult.relativeWindDirection? windForceAndDriftResult.relativeWindDirection : 0)}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.relative-wind-speed")} (m/s)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{Math.round(windForceAndDriftResult.relativeWindSpeed)} m/s</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.estimated-drift-angle")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{windForceAndDriftResult.estimatedDriftAngle.toLocaleString(i18n.language, {maximumFractionDigits: 2})}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.estimated-vessel-breadth-due-drift")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{windForceAndDriftResult.estimatedBreadth.toLocaleString(i18n.language, {maximumFractionDigits: 2})} m</h4></IonText></IonNote>
              </IonItem>
            </IonList>
          </IonAccordion>
        </IonAccordionGroup>
      </IonCardContent>
    </IonCard>
  );
};

export default Calculations;
// Declare constants for calculations
const DRAG_COEFFICIENT = 1.14;
const GRAVITATIONAL_ACCELERATION = 9.80665;
const DRIFT_COEFFICIENTS: number[][] = [
  [0, 0.012, 0.009, 0.009, 0.022, 0.027, 0.036, 0.045, 0.057, 0.072, 0.089, 0.109, 0.136, 0.162, 0.173, 0.156, 0.119, 0.074, 0],
  [0, 0.026, 0.045, 0.055, 0.067, 0.072, 0.046, 0.031, 0.019, 0.011, 0.032, 0.048, 0.066, 0.09, 0.099, 0.087, 0.065, 0.033, 0],
  [0, 0.023, 0.041, 0.049, 0.072, 0.066, 0.02, 0.009, 0.012, 0.033, 0.059, 0.089, 0.103, 0.117, 0.14, 0.111, 0.08, 0.05, 0],
  [0, 0.013, 0.025, 0.03, 0.032, 0.031, 0.029, 0.015, 0.005, 0.022, 0.041, 0.059, 0.073, 0.081, 0.089, 0.075, 0.053, 0.024, 0],
];

export function getNumberValueOrEmptyString(value: number): number | '' {
  return isNaN(value) ? '' : value;
}

// Common helper functions
function toRad(x: number) {
  return x * (Math.PI / 180);
}

export function toDeg(x: number) {
  return x * (180 / Math.PI);
}

function acot(x: number) {
  return Math.PI / 2 - Math.atan(x);
}

function nauticalMilesToMetres(x: number) {
  return x * 1852;
}

export function knotsToMetresPerSecond(x: number) {
  return (x * 1.852) / 3.6;
}

// Squat calculations

// 1. Vessel
export function calculateDisplacement(lengthBPP: number, breadth: number, draught: number, blockCoefficient: number, waterDensity: number) {
  return Math.round((lengthBPP * breadth * draught * blockCoefficient * waterDensity) / 1000);
}

export function calculateKB(draught: number) {
  return draught / 2;
}

// 2. Environment
export function calculateFroudeNumber(vesselSpeed: number, sweptDepth: number, waterLevel: number) {
  // Froude_Nro_HG_Cal | (Set_Vessel_Speed*1852/3600)/(Sqrt(9.81*(Swept_Depth+Water_Level)))
  return knotsToMetresPerSecond(vesselSpeed) / Math.sqrt(GRAVITATIONAL_ACCELERATION * (sweptDepth + waterLevel / 100));
}

// 3. Wind, drift & squat calculations
export function calculateApparentWindProperties(vesselSpeed: number, vesselCourse: number, windSpeed: number, windDirection: number) {
  const vesselSpeedMS = knotsToMetresPerSecond(vesselSpeed);
  const angleDiff = vesselCourse - windDirection;
  let windAngleDriftRAD = toRad(Math.abs(angleDiff));
  if (Math.abs(angleDiff) > 180) {
    windAngleDriftRAD = toRad(Math.abs(angleDiff + 360));
  }
  // Sqrt(Wind_Speed_Drift_Cal*Wind_Speed_Drift_Cal+Ship_Speed_Drift_Cal*Ship_Speed_Drift_Cal+2*Wind_Speed_Drift_Cal*Ship_Speed_Drift_Cal*Cos(Wind_Angle_Rad_Drift_Cal))
  const apparentWindVelocityDrift = Math.sqrt(
    Math.pow(windSpeed, 2) + Math.pow(vesselSpeedMS, 2) + 2 * windSpeed * vesselSpeedMS * Math.cos(windAngleDriftRAD)
  );
  // Acos((Wind_Speed_Drift_Cal*Cos(Wind_Angle_Rad_Drift_Cal)+Ship_Speed_Drift_Cal)/Apparent_Wind_Velocity_Drift_Cal)
  const apparentWindAngleDrift = toDeg(Math.acos((windSpeed * Math.cos(windAngleDriftRAD) + vesselSpeedMS) / apparentWindVelocityDrift));
  return [apparentWindVelocityDrift, apparentWindAngleDrift];
}

export function calculateWindForce(
  airDensity: number,
  windSpeed: number,
  windSurface: number,
  safetyMarginWindForce: number,
  apparentWindAngleDrift: number
) {
  // 0.5*Set_Density_Air/10*Set_Wind_Speed*Set_Wind_Speed*Abs(Total_Lateral_Surface_Area)/9.80665*1.14/1000*Sin(Radians(Apparent_Wind_Angle_Deg))
  const safetyMargin = 1 + safetyMarginWindForce / 100;
  return (
    ((((0.5 * airDensity * Math.pow(windSpeed, 2) * Math.abs(windSurface)) / GRAVITATIONAL_ACCELERATION) * DRAG_COEFFICIENT) / 1000) *
    Math.sin(toRad(apparentWindAngleDrift)) *
    safetyMargin
  );
}

export function calculateWaveForce(waterDensity: number, lengthBPP: number, waveHeight: number, apparentWindAngleDrift: number) {
  // 0.35*Set_Density_Water*0.25*Length_BPP*(Set_Wave_Height/10)*(Set_Wave_Height/10)/1000*Sin(Radians(Apparent_Wind_Angle_Deg))
  return ((0.35 * waterDensity * 0.25 * lengthBPP * Math.pow(waveHeight, 2)) / 1000) * Math.sin(toRad(apparentWindAngleDrift));
}

export function calculateBowThrusterForce(bowThruster: number, bowThrusterEfficiency: number) {
  // (Bow_Thruster*1.34/100)*Set_Bow_Thruster_Efficiency.Value*25/100
  return (((bowThruster * 1.34) / 100) * bowThrusterEfficiency) / 100;
}

export function calculateSafetyMargin(bowThrusterForce: number, windForce: number, waveForce: number) {
  // (((Bow_Thruster_Force*2)-(Wind_Force+Wave_Force))/Bow_Thruster_Force)*100
  return (bowThrusterForce * 2 - (windForce + waveForce)) / bowThrusterForce;
}

export function calculateMinimumExternalForce(bowThrusterForce: number, windForce: number, waveForce: number) {
  // If(Bow_Thruster_Force*2 >= Wind_Force+Wave_Force, "-", (Wind_Force+Wave_Force)-Bow_Thruster_Force*2)
  let minExternalForce = 0;
  if (bowThrusterForce * 2 < windForce + waveForce) {
    minExternalForce = windForce + waveForce - bowThrusterForce * 2;
  }
  return minExternalForce;
}

function getDriftIndex(apparentWindAngleDrift: number) {
  switch (true) {
    case apparentWindAngleDrift <= 10:
      return 0;
    case apparentWindAngleDrift <= 20:
      return 1;
    case apparentWindAngleDrift <= 30:
      return 2;
    case apparentWindAngleDrift <= 40:
      return 3;
    case apparentWindAngleDrift <= 50:
      return 4;
    case apparentWindAngleDrift <= 60:
      return 5;
    case apparentWindAngleDrift <= 70:
      return 6;
    case apparentWindAngleDrift <= 80:
      return 7;
    case apparentWindAngleDrift <= 90:
      return 8;
    case apparentWindAngleDrift <= 100:
      return 9;
    case apparentWindAngleDrift < 110:
      return 10;
    case apparentWindAngleDrift < 120:
      return 11;
    case apparentWindAngleDrift < 130:
      return 12;
    case apparentWindAngleDrift < 140:
      return 13;
    case apparentWindAngleDrift < 150:
      return 14;
    case apparentWindAngleDrift < 160:
      return 15;
    case apparentWindAngleDrift <= 170:
      return 16;
    default:
      return 17;
  }
}

export interface DriftAngleCalcParameters {
  lengthBPP: number;
  draught: number;
  profileIndex: number;
  vesselSpeed: number;
  windSurface: number;
  airDensity: number;
  waterDensity: number;
  apparentWindAngleDrift: number;
  apparentWindVelocityDrift: number;
}

export function calculateEstimatedDriftAngle(params: DriftAngleCalcParameters) {
  const driftIndex = getDriftIndex(params.apparentWindAngleDrift);

  // ((Apparent_Wind_Angle_Deg-(Nro_Drift_Cal_1*10))*(('Cn_ Bulker_Drift_Cal_20'-'Cn_ Bulker_Drift_Cal_19')/10)) + 'Cn_ Bulker_Drift_Cal_19'
  const driftCoefficient =
    (params.apparentWindAngleDrift - driftIndex * 10) *
      ((DRIFT_COEFFICIENTS[params.profileIndex][driftIndex + 1] - DRIFT_COEFFICIENTS[params.profileIndex][driftIndex]) / 10) +
    DRIFT_COEFFICIENTS[params.profileIndex][driftIndex];
  // (Air_Density_Drift_Cal/Sea_Density_Drift_Cal)*((Apparent_Wind_Velocity_Drift_Cal/Ship_Speed_Drift_Cal)*(Apparent_Wind_Velocity_Drift_Cal/Ship_Speed_Drift_Cal))
  // *(Total_Lateral_Surface_Area_Drift_Cal /((Vessel_Draught_Drift_Cal*Vessel_Draught_Drift_Cal))*Cn_Drift_Cal)/ (Pi()*(0.5+(2.4*Vessel_Draught_Drift_Cal/'Length_ BPP_Drift_Cal')))
  return (
    ((params.airDensity / params.waterDensity) *
      Math.pow(params.apparentWindVelocityDrift / knotsToMetresPerSecond(params.vesselSpeed), 2) *
      ((Math.abs(params.windSurface) / Math.pow(params.draught, 2)) * driftCoefficient)) /
    (Math.PI * (0.5 + (2.4 * params.draught) / params.lengthBPP))
  );
}

export function calculateEstimatedBreadth(lengthBPP: number, breadth: number, estimatedDriftAngle: number) {
  // Length_BPP*Sin(Drift_Angle_Drift_Cal)+Breadth
  const estimatedDriftBreadth = lengthBPP * Math.sin(estimatedDriftAngle);
  return (isNaN(estimatedDriftBreadth) ? 0 : estimatedDriftBreadth) + parseFloat(breadth.toString());
}

export function calculateHeelDueWind(lengthBPP: number, windSurface: number, displacement: number, GM: number, KB: number, windForce: number) {
  // (Total_Lateral_Surface_Area/Length_BPP/2 + KB) * Wind_Force --> (2*Total_Lateral_Surface_Area/Length_BPP + KB) * Wind_Force
  const windMoment = ((2 * windSurface) / lengthBPP + parseFloat(KB.toString())) * windForce;
  // GM/Wind_Moment/Displacement
  const windHeel = GM / (windMoment / displacement);
  // If(IsBlank(GM), "", Text(Acot(Radians(Wind_Heel)), "0.0"))
  return acot(toRad(windHeel));
}

export function calculateHeelDuringTurn(vesselSpeed: number, turningRadius: number, KG: number, GM: number, KB: number) {
  const vesselSpeedMS = knotsToMetresPerSecond(vesselSpeed);
  // Tan((Speed_HG_Cal*Speed_HG_Cal*BG_HG_Cal)/(9.81*Radius_HG_Cal*GM))
  return toDeg(Math.tan((Math.pow(vesselSpeedMS, 2) * Math.abs(KG - KB)) / (GRAVITATIONAL_ACCELERATION * nauticalMilesToMetres(turningRadius) * GM)));
}

export function calculateDraughtDueWind(breadth: number, draught: number, windHeelDeg: number) {
  // Text((0.5*Breadth*Sin(Radians(Wind_Heel_Degrees)))+(Vessel_Draught*Cos(Radians(Wind_Heel_Degrees))), "0.00")
  return 0.5 * breadth * Math.sin(toRad(windHeelDeg)) + draught * Math.cos(toRad(windHeelDeg));
}

export function calculateDraughtDuringTurn(breadth: number, draught: number, heelDuringTurnDeg: number) {
  // Breadth/2*Sin(Radians(List_degrees_HG_Cal))+(Vessel_Draught*Cos(Radians(List_degrees_HG_Cal)))
  return (breadth / 2) * Math.sin(toRad(heelDuringTurnDeg)) + draught * Math.cos(toRad(heelDuringTurnDeg));
}

export function calculateSquatBarrass(draught: number, blockCoefficient: number, sweptDepth: number, vesselSpeed: number) {
  // Set_Vessel_Speed*Set_Vessel_Speed*Vessel_Draught/Swept_Depth*Block_Coefficient/100
  return (((Math.pow(vesselSpeed, 2) * draught) / sweptDepth) * blockCoefficient) / 100;
}

function getACofficients(slopeRatio: number): number[] {
  // a0_HG_Cal | If(Value('h1/h_HG_Cal'.Text)<=0.3,0.46, If(Value('h1/h_HG_Cal'.Text)<=0.5,0.21, If(Value('h1/h_HG_Cal'.Text)<=0.7, 1.1, If(Value('h1/h_HG_Cal'.Text)<=1.0, 0.82, 1))))
  // a1_HG_Cal | If(Value('h1/h_HG_Cal'.Text)<=0.3,15.85, If(Value('h1/h_HG_Cal'.Text)<=0.5,28.20, If(Value('h1/h_HG_Cal'.Text)<=0.7, -5.55, If(Value('h1/h_HG_Cal'.Text)<=1.0, 6.11, 0))))
  // a2_HG_Cal | If(Value('h1/h_HG_Cal'.Text)<=0.3,124.06, If(Value('h1/h_HG_Cal'.Text)<=0.5,-53.17, If(Value('h1/h_HG_Cal'.Text)<=0.7, 167.76, If(Value('h1/h_HG_Cal'.Text)<=1.0, 16.9, 0))))
  // a3_HG_Cal | If(Value('h1/h_HG_Cal'.Text)<=0.3,-380.04, If(Value('h1/h_HG_Cal'.Text)<=0.5,87.97, If(Value('h1/h_HG_Cal'.Text)<=0.7, -417.72, If(Value('h1/h_HG_Cal'.Text)<=1.0, -70.86, 0))))
  let aCoefficients = [1, 0, 0, 0];
  if (slopeRatio <= 0.3) {
    aCoefficients = [0.46, 15.85, 124.06, -380.04];
  } else if (slopeRatio <= 0.5) {
    aCoefficients = [0.21, 28.2, -53.17, 87.97];
  } else if (slopeRatio <= 0.7) {
    aCoefficients = [1.1, -5.55, 167.76, -417.72];
  } else if (slopeRatio <= 1.0) {
    aCoefficients = [0.82, 6.11, 16.9, -70.86];
  }
  return aCoefficients;
}

export interface SquatHGCalcParameters {
  lengthBPP: number;
  breadth: number;
  draught: number;
  blockCoefficient: number;
  sweptDepth: number;
  waterLevel: number;
  fairwayFormIndex: number;
  channelWidth: number;
  slopeScale: number;
  slopeHeight: number;
  vesselSpeed: number;
  draughtDuringTurn: number;
  C0Coefficient?: number;
}
export function calculateSquatHG(params: SquatHGCalcParameters) {
  const c0Coefficient = params.C0Coefficient ? params.C0Coefficient : 2.4;

  // Ship_m2_HG_Cal | 0.98*Breadth_HG_Cal*Vessel_Draught
  const shipM2 = 0.98 * params.breadth * params.draught;
  // Channel_m2_HG_Cal | Channel_Width*Swept_Depth+Swept_Depth*Swept_Depth/Slope_Scale
  const channelM2 = params.channelWidth * params.sweptDepth + Math.pow(params.sweptDepth, 2) / params.slopeScale;
  // S_HG_Cal | Ship_m2_HG_Cal/Channel_m2_HG_Cal
  const s = shipM2 / channelM2;
  // h1/h_HG_Cal | Slope_Height/Swept_Depth
  const slopeRatio = params.slopeHeight / params.sweptDepth;

  const aCoefficients = getACofficients(slopeRatio);

  // K1_HG_Cal | a0_HG_Cal+a1_HG_Cal*S_HG_Cal+a2_HG_Cal*S_HG_Cal*S_HG_Cal+a3_HG_Cal*S_HG_Cal*S_HG_Cal*S_HG_Cal
  const k1 = aCoefficients[0] + aCoefficients[1] * s + aCoefficients[2] * Math.pow(s, 2) + aCoefficients[3] * Math.pow(s, 3);
  // s1_Multiplier_From_Curve_HG_Cal
  // If(Select_Fairway_Form.SelectedText.Value ="Open Water", 0.03, If(Select_Fairway_Form.SelectedText.Value = "Sloped Channel", Text(S_HG_Cal/K1_HG_Cal), Text(S_HG_Cal)))
  let s1Multiplier = 0.03;
  switch (params.fairwayFormIndex) {
    case 1:
      s1Multiplier = s;
      break;
    case 2:
      s1Multiplier = s / k1;
      break;
  }
  // Ks_HG_Cal
  // If(Value(s1_Multiplier_From_Curve_HG_Cal.Text) > 0.03, Value(s1_Multiplier_From_Curve_HG_Cal.Text)*7.45+0.76 , 1)
  const Ks = s1Multiplier > 0.03 ? s1Multiplier * 7.45 + 0.76 : 1;
  const froudeNumber = calculateFroudeNumber(params.vesselSpeed, params.sweptDepth, params.waterLevel);
  // Froude_Nro1_HG_Cal | 1-Froude_Nro_HG_Cal^2
  const froudeNumber1 = 1 - Math.pow(froudeNumber, 2);

  // Final squat HG value (Squat_HG_Cal)
  // (2.4*Ks_HG_Cal*Block_Coefficient*Breadth*Vessel_Draught*Froude_Nro_HG_Cal*Froude_Nro_HG_Cal)/(Length_BPP*Sqrt(Froude_Nro1_HG_Cal))
  const squatHG =
    (c0Coefficient * Ks * params.blockCoefficient * params.breadth * params.draught * Math.pow(froudeNumber, 2)) /
    (params.lengthBPP * Math.sqrt(froudeNumber1));
  // Final squat HG Listed value (Squat_Listed_HG_Cal)
  // (2.4*Ks_HG_Cal*Block_Coefficient*Breadth*'Draught_during turn_HG_Cal'*Froude_Nro_HG_Cal*Froude_Nro_HG_Cal)/(Length_BPP*Sqrt(Froude_Nro1_HG_Cal))
  const squatHGListed =
    (c0Coefficient * Ks * params.blockCoefficient * params.breadth * params.draughtDuringTurn * Math.pow(froudeNumber, 2)) /
    (params.lengthBPP * Math.sqrt(froudeNumber1));

  return [squatHG, squatHGListed];
}

export function calculateUKCStraightCourse(sweptDepth: number, waterLevel: number, correctedDraught: number, squatBarrass: number, squatHG: number) {
  // Swept_Depth+Water_Level-Draught_Heel-Squat
  const resultWOSquat = sweptDepth + waterLevel / 100 - correctedDraught;
  return [resultWOSquat - squatBarrass, resultWOSquat - squatHG];
}

export function calculateUKCDuringTurn(
  draught: number,
  sweptDepth: number,
  waterLevel: number,
  correctedDraughtDuringTurn: number,
  squatBarrass: number,
  squatHG: number
) {
  // (Swept_Depth+Water_Level)-(Draught_During_Turn-Vessel_Draught)*2-Vessel_Draught-Squat
  const resultWOSquat = sweptDepth + waterLevel / 100 - (correctedDraughtDuringTurn - draught) * 2 - draught;
  return [resultWOSquat - squatBarrass, resultWOSquat - squatHG];
}

export function calculateWaveLengthProperties(wavePeriod: number, sweptDepth: number) {
  // Wavelength_HG_Cal | Text((9.80665/(Pi()*2))*Wave_Period*Wave_Period, "[$-fi-FI]0,00")
  const waveLengthDeep = (GRAVITATIONAL_ACCELERATION / (Math.PI * 2)) * Math.pow(wavePeriod, 2);
  // k0Shallow_HG_Cal | (Pi()*2)/Wavelength_HG_Cal
  const k0Shallow = (Math.PI * 2) / waveLengthDeep;
  // DShallow_HG_Cal | k0Shallow_HG_Cal*Swept_Depth
  const dShallow = k0Shallow * sweptDepth;
  // fDShallow_HG_Cal | (1/(1+(0.6522*DShallow_HG_Cal)+(0.4622*DShallow_HG_Cal*DShallow_HG_Cal)+(0.0864*DShallow_HG_Cal*DShallow_HG_Cal*DShallow_HG_Cal*DShallow_HG_Cal)+(0.0675*DShallow_HG_Cal*DShallow_HG_Cal*DShallow_HG_Cal*DShallow_HG_Cal*DShallow_HG_Cal)))+DShallow_HG_Cal
  const fDShallow =
    1 / (1 + 0.6522 * dShallow + 0.4622 * Math.pow(dShallow, 2) + 0.0864 * Math.pow(dShallow, 4) + 0.0675 * Math.pow(dShallow, 5)) + dShallow;
  // cShallow_HG_Cal | Sqrt((9.80665*Swept_Depth)/fDShallow_HG_Cal)
  const cShallow = Math.sqrt((GRAVITATIONAL_ACCELERATION * sweptDepth) / fDShallow);
  // c0Shallow_HG_Cal | ((Pi()*2)/Wave_Period)/k0Shallow_HG_Cal
  const c0Shallow = (Math.PI * 2) / wavePeriod / k0Shallow;
  // WavelengthShallow_HG_Cal | Text((cShallow_HG_Cal/c0Shallow_HG_Cal)*Wavelength_HG_Cal, "[$-fi-FI]0,00")
  const waveLengthShallow = (cShallow / c0Shallow) * waveLengthDeep;
  return [waveLengthShallow, waveLengthDeep];
}

export function calculateWaveAmplitudeProperties(lengthBPP: number, waveHeight: number, waveLength: number[]) {
  // x_Value_HG_Cal | Wavelength_HG_Cal/Length_BPP
  const xValue = waveLength[1] / lengthBPP;
  // x_ShallowValue_HG_Cal | WavelengthShallow_HG_Cal/Length_BPP
  const xValueShallow = waveLength[0] / lengthBPP;

  // RAO_HG_Cal | If(Value(x_Value_HG_Cal.Text) > 2.6, 1, If(Value(x_Value_HG_Cal.Text) >= 0.65, Ln(x_Value_HG_Cal)*0.7061+0.3453, 0))
  // RAOShallow_HG_Cal | If(Value(x_ShallowValue_HG_Cal.Text) > 2.6, 1, If(Value(x_ShallowValue_HG_Cal.Text) >= 0.65, Ln(x_ShallowValue_HG_Cal)*0.7061+0.3453, 0))
  let RAODeep = Math.log(xValue) * 0.7061 + 0.3453;
  if (xValue > 2.6) {
    RAODeep = 1;
  } else if (xValue < 0.65) {
    RAODeep = 0;
  }
  let RAOShallow = Math.log(xValueShallow) * 0.7061 + 0.3453;
  if (xValueShallow > 2.6) {
    RAOShallow = 1;
  } else if (xValueShallow < 0.65) {
    RAOShallow = 0;
  }
  // Wavenumber_HG_Cal | Pi()*2/Wavelength_HG_Cal
  // WavenumberShallow_HG_Cal | Pi()*2/WavelengthShallow_HG_Cal
  const waveNumber = (Math.PI * 2) / waveLength[1];
  const waveNumberShallow = (Math.PI * 2) / waveLength[0];

  // Amplitude_HG_Cal | Text((RAO_HG_Cal*Wavenumber_HG_Cal*Wave_Height/10*Length_BPP)/4, "[$-fi-FI]0,00")
  const waveAmplitudeDeep = (RAODeep * waveNumber * waveHeight * lengthBPP) / 4;
  // AmplitudeShallow_HG_Cal | Text((RAOShallow_HG_Cal*WavenumberShallow_HG_Cal*Wave_Height/10*Length_BPP)/4, "[$-fi-FI]0,00")
  const waveAmplitudeShallow = (RAOShallow * waveNumberShallow * waveHeight * lengthBPP) / 4;
  return [waveAmplitudeShallow, waveAmplitudeDeep];
}

export function calculateUKCVesselMotions(waveAmplitude: number[], UKCStraightCourseBarrass: number, UKCStraightCourseHG: number) {
  // Text(UKC_Straight-AmplitudeShallow_HG_Cal) | Text(UKC_Straight-Amplitude_HG_Cal)
  return [
    [UKCStraightCourseBarrass - waveAmplitude[0], UKCStraightCourseBarrass - waveAmplitude[1]],
    [UKCStraightCourseHG - waveAmplitude[0], UKCStraightCourseHG - waveAmplitude[1]],
  ];
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SquatReducer, initialState, Action } from '../hooks/squatReducer';
import {
  toDeg,
  knotsToMetresPerSecond,
  calculateKB,
  calculateDisplacement,
  calculateFroudeNumber,
  calculateApparentWindProperties,
  calculateWindForce,
  calculateWaveForce,
  calculateBowThrusterForce,
  calculateSafetyMargin,
  calculateMinimumExternalForce,
  calculateEstimatedDriftAngle,
  calculateEstimatedBreadth,
  calculateHeelDueWind,
  calculateHeelDuringTurn,
  calculateDraughtDueWind,
  calculateDraughtDuringTurn,
  calculateSquatBarrass,
  calculateSquatHG,
  calculateUKCStraightCourse,
  calculateUKCDuringTurn,
  calculateWaveLengthProperties,
  calculateWaveAmplitudeProperties,
  calculateUKCVesselMotions,
} from './calculations';

/* Test general helper functions */
test('calculates correct radians to degree conversion', () => {
  expect(Math.round(toDeg(2.0944))).toEqual(120);
});

test('calculates correct knots to m/s conversion', () => {
  expect(Math.round(knotsToMetresPerSecond(15.56))).toEqual(8);
});

/* Tests for vessel value calculations */
test('calculates correct displacement value', () => {
  expect(calculateDisplacement(200, 20, 20, 0.75, 1005)).toEqual(60300);
});

test('calculates correct KB value', () => {
  const updateAction = { type: 'vessel-stability', payload: { key: 'KB', value: calculateKB(20) } } as Action;
  const updatedState = SquatReducer(initialState, updateAction);
  expect(updatedState.vessel.stability.KB).toEqual(10);
});

/* Tests for environment value calculations */

test('calculates correct Froude number value', () => {
  expect(Number(calculateFroudeNumber(15, 20, 0).toFixed(3))).toEqual(0.551);
});

/* Tests for result calculations */

test('calculates correct apparent wind properties', () => {
  const [apparentWindVelocityDrift, apparentWindAngleDrift] = calculateApparentWindProperties(15, 0, 15, 270);
  expect(Number(apparentWindVelocityDrift.toFixed(2))).toEqual(16.87);
  expect(Number(apparentWindAngleDrift.toFixed(2))).toEqual(62.78);
});

test('calculates correct wind force', () => {
  expect(Number(calculateWindForce(1, 15, 1000, 0, 62.78).toFixed(2))).toEqual(11.63);
});

test('calculates correct wind force with safety margin', () => {
  expect(Number(calculateWindForce(1, 15, 1000, 25, 62.78).toFixed(2))).toEqual(14.54);
});

test('calculates correct wave force', () => {
  expect(Number(calculateWaveForce(1005, 200, 2, 62.78).toFixed(2))).toEqual(62.56);
});

test('calculates correct bow thruster force', () => {
  expect(Number(calculateBowThrusterForce(5000, 75).toFixed(2))).toEqual(50.25);
});

test('calculates correct safety margin', () => {
  expect(Number(calculateSafetyMargin(50, 12, 62).toFixed(2))).toEqual(0.52);
});

test('calculates correct minimum external force', () => {
  expect(Number(calculateMinimumExternalForce(35, 12, 63).toFixed(2))).toEqual(5);
});

test('calculates correct estimated drift angle', () => {
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 9,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0012);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 19,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.001);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 29,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.001);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 39,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0023);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 49,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0029);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 59,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0038);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 69,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0048);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 70.67,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.005);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 89,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0077);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 99,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0095);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 109,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0117);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 119,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0146);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 129,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0174);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 139,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0188);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 149,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0172);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 159,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0134);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 169,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0086);
  expect(
    Number(
      calculateEstimatedDriftAngle({
        lengthBPP: 200,
        draught: 20,
        profileIndex: 0,
        vesselSpeed: 15,
        windSurface: 8600,
        airDensity: 1.3,
        waterDensity: 1005,
        apparentWindAngleDrift: 179,
        apparentWindVelocityDrift: 23.31,
      }).toFixed(4)
    )
  ).toEqual(0.0008);
});

test('calculates correct estimated breadth', () => {
  expect(Number(calculateEstimatedBreadth(200, 20, 0.005).toFixed(2))).toEqual(21);
});

test('calculates correct heel value due wind', () => {
  expect(Number(calculateHeelDueWind(200, 5000, 60300, 2, 10, 70).toFixed(2))).toEqual(1.11);
});

test('calculates correct heel value during turn', () => {
  expect(Number(calculateHeelDuringTurn(15, 0.75, 5, 2, 10).toFixed(2))).toEqual(0.63);
});

test('calculates correct draught value due wind', () => {
  expect(Number(calculateDraughtDueWind(20, 20, 1.11).toFixed(2))).toEqual(20.19);
});

test('calculates correct draught value during turn', () => {
  expect(Number(calculateDraughtDuringTurn(20, 20, 0.63).toFixed(2))).toEqual(20.11);
});

test('calculates correct squat value (Barrass)', () => {
  expect(Number(calculateSquatBarrass(20, 0.75, 26, 15).toFixed(2))).toEqual(1.3);
});

test('calculates correct squat value (Huuska-Guliev)', () => {
  const [squatHG, squatHGListed] = calculateSquatHG({
    lengthBPP: 200,
    breadth: 20,
    draught: 20,
    blockCoefficient: 0.75,
    sweptDepth: 18,
    waterLevel: 0,
    fairwayFormIndex: 2,
    channelWidth: 30,
    slopeScale: 10,
    slopeHeight: 5,
    vesselSpeed: 15,
    draughtDuringTurn: 20.1,
    C0Coefficient: 2.4,
  });
  expect(Number(squatHG.toFixed(2))).toEqual(1.49);
  expect(Number(squatHGListed.toFixed(2))).toEqual(1.5);

  const [squatHG2, squatHGListed2] = calculateSquatHG({
    lengthBPP: 200,
    breadth: 20,
    draught: 20,
    blockCoefficient: 0.75,
    sweptDepth: 18,
    waterLevel: 0,
    fairwayFormIndex: 2,
    channelWidth: 30,
    slopeScale: 10,
    slopeHeight: 8,
    vesselSpeed: 15,
    draughtDuringTurn: 20.1,
    C0Coefficient: 2.4,
  });
  expect(Number(squatHG2.toFixed(2))).toEqual(1.49);
  expect(Number(squatHGListed2.toFixed(2))).toEqual(1.5);

  const [squatHG3, squatHGListed3] = calculateSquatHG({
    lengthBPP: 200,
    breadth: 20,
    draught: 20,
    blockCoefficient: 0.75,
    sweptDepth: 18,
    waterLevel: 0,
    fairwayFormIndex: 2,
    channelWidth: 30,
    slopeScale: 10,
    slopeHeight: 10,
    vesselSpeed: 15,
    draughtDuringTurn: 20.1,
    C0Coefficient: 2.4,
  });
  expect(Number(squatHG3.toFixed(2))).toEqual(1.49);
  expect(Number(squatHGListed3.toFixed(2))).toEqual(1.5);

  const [squatHG4, squatHGListed4] = calculateSquatHG({
    lengthBPP: 200,
    breadth: 20,
    draught: 20,
    blockCoefficient: 0.75,
    sweptDepth: 18,
    waterLevel: 0,
    fairwayFormIndex: 2,
    channelWidth: 30,
    slopeScale: 10,
    slopeHeight: 14,
    vesselSpeed: 15,
    draughtDuringTurn: 20.1,
    C0Coefficient: 2.4,
  });
  expect(Number(squatHG4.toFixed(2))).toEqual(1.49);
  expect(Number(squatHGListed4.toFixed(2))).toEqual(1.5);

  const [squatHG5, squatHGListed5] = calculateSquatHG({
    lengthBPP: 200,
    breadth: 15,
    draught: 15,
    blockCoefficient: 0.75,
    sweptDepth: 18,
    waterLevel: 0,
    fairwayFormIndex: 1,
    channelWidth: 30,
    slopeScale: 10,
    slopeHeight: 10,
    vesselSpeed: 15,
    draughtDuringTurn: 20.1,
  });
  expect(Number(squatHG5.toFixed(2))).toEqual(3.05);
  expect(Number(squatHGListed5.toFixed(2))).toEqual(4.08);
});

test('calculates correct UKC value with straight course', () => {
  const [UKCStraightCourseBarrass, UKCStraightCourseHG] = calculateUKCStraightCourse(26, 0, 20.8, 1.3, 1.5);
  expect(Number(UKCStraightCourseBarrass.toFixed(2))).toEqual(3.9);
  expect(Number(UKCStraightCourseHG.toFixed(2))).toEqual(3.7);
});

test('calculates correct UKC value during turn', () => {
  const [UKCDuringTurnBarrass, UKCDuringTurnHG] = calculateUKCDuringTurn(20, 26, 0, 20.5, 1.3, 1.5);
  expect(Number(UKCDuringTurnBarrass.toFixed(2))).toEqual(3.7);
  expect(Number(UKCDuringTurnHG.toFixed(2))).toEqual(3.5);
});

test('calculates correct wave length properties', () => {
  const [waveLengthShallow, waveLengthDeep] = calculateWaveLengthProperties(30, 18);
  expect(Number(waveLengthShallow.toFixed(2))).toEqual(393.13);
  expect(Number(waveLengthDeep.toFixed(2))).toEqual(1404.7);
});

test('calculates correct wave amplitude properties', () => {
  const [waveAmplitudeShallow, waveAmplitudeDeep] = calculateWaveAmplitudeProperties(200, 2, [200, 500]);
  expect(Number(waveAmplitudeShallow.toFixed(2))).toEqual(1.08);
  expect(Number(waveAmplitudeDeep.toFixed(2))).toEqual(1.25);
  const [waveAmplitudeShallow2, waveAmplitudeDeep2] = calculateWaveAmplitudeProperties(100, 2, [400, 500]);
  expect(Number(waveAmplitudeShallow2.toFixed(2))).toEqual(0.79);
  expect(Number(waveAmplitudeDeep2.toFixed(2))).toEqual(0.63);
  const [waveAmplitudeShallow3, waveAmplitudeDeep3] = calculateWaveAmplitudeProperties(220, 2, [100, 130]);
  expect(Number(waveAmplitudeShallow3)).toEqual(0);
  expect(Number(waveAmplitudeDeep3)).toEqual(0);
});

test('calculates correct UKC vessel motions values', () => {
  const [UKCVesselMotionBarrass, UKCVesselMotionHG] = calculateUKCVesselMotions([1.1, 1.3], 3.9, 3.7);
  expect(Number(UKCVesselMotionBarrass[0].toFixed(2))).toEqual(2.8);
  expect(Number(UKCVesselMotionBarrass[1].toFixed(2))).toEqual(2.6);
  expect(Number(UKCVesselMotionHG[0].toFixed(2))).toEqual(2.6);
  expect(Number(UKCVesselMotionHG[1].toFixed(2))).toEqual(2.4);
});

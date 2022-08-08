import React from 'react';
import { calculateFroudeNumber } from './calculations';
import i18n from '../i18n';
import { t } from 'i18next';

// General validations
export const isTugUseRecommended = (bowThrusterForce: number, externalForceRequired: number) => {
  // If(Value(Bow_Thruster_Force.Text) > 0, If(Value(Minimum_Force_Required.Text) > 0, true, false))
  if (bowThrusterForce > 0 && externalForceRequired > 0) {
    return true;
  }
  return false;
};
export const isThrusterUnableToLiftBow = (lengthBPP: number, bowThruster: number, bowThrusterForce: number, windForce: number, waveForce: number) => {
  // If(Value(Bow_Thruster_Force.Text) > 0, If((Length_BPP*0.25*(Wind_Force+Wave_Force))-(Length_BPP*0.75*Bow_Thruster*1.34/100)>0, true, false))
  if (bowThrusterForce > 0 && lengthBPP * 0.25 * (windForce + waveForce) - (lengthBPP * 0.75 * bowThruster * 1.34) / 100 > 0) {
    return true;
  }
  return false;
};

export const isReliabilityAnIssue = (blockCoefficient: number, vesselSpeed: number, sweptDepth: number, waterLevel: number) => {
  //  If(Value(Froude_Nro_HG_Cal.Text) > 0.7, "Reliability Issue - Froude Number > 0,7", If(Value(Block_Coefficient.Text) < 0.6, "Reliability Issue - Block Coefficient < 0,60", If(Value(Block_Coefficient.Text) > 0.8, "Reliability Issue - Block Coefficient > 0,80", "")))
  const froudeNumber = calculateFroudeNumber(vesselSpeed, sweptDepth, waterLevel);

  if (froudeNumber > 0.7) {
    return (
      <>
        {t('homePage.squat.environment.reliability-issue-froude-number')} &gt;{' '}
        {(0.7).toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </>
    );
  } else if (blockCoefficient < 0.6) {
    return (
      <>
        {t('homePage.squat.environment.reliability-issue-block-coefficient')} &lt;{' '}
        {(0.6).toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </>
    );
  } else if (blockCoefficient > 0.8) {
    return (
      <>
        {t('homePage.squat.environment.reliability-issue-block-coefficient')} &gt;{' '}
        {(0.8).toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </>
    );
  }
  return '';
};

export const isUKCUnderMinimum = (
  sweptDepth: number,
  requiredUKC: number,
  UKCDuringTurn: number[],
  UKCStraightCourse: number[],
  UKCVesselMotions: number[][],
  showBarrass: boolean
) => {
  // If(IsBlank(Swept_Depth), false,
  // If(Value(UKC_During_Turn.Text) < Value(Required_UKC.Text), true, If(Value(UKC_Straight.Text) < Value(Required_UKC.Text), true, If(Value(UKC_Ship_Motions.Text) < Value(Required_UKC.Text), true, false))))
  if (!sweptDepth) {
    return false;
  }
  if (
    (showBarrass ? UKCDuringTurn[0] : UKCDuringTurn[1]) < requiredUKC ||
    (showBarrass ? UKCStraightCourse[0] : UKCStraightCourse[1]) < requiredUKC ||
    (showBarrass ? UKCVesselMotions[0][0] : UKCVesselMotions[0][1]) < requiredUKC
  ) {
    return true;
  }
  return false;
};

// Field validations
export const isSafetyMarginInsufficient = (safetyMarginWindForce: number, remainingSafetyMargin: number) => {
  // If(Value(Remaining_Safety_Margin.Text) < Set_Safety_Margin.Value/100, 5, 0)
  return remainingSafetyMargin < safetyMarginWindForce / 100;
};

export const isExternalForceRequired = (externalForceRequired: number) => {
  // If(Value(Minimum_Force_Required.Text) > 0, 5, 0)
  return externalForceRequired > 0;
};

export const isUKCShipMotionsUnderRequired = (requiredUKC: number, UKCVesselMotions: number[][], showBarrass: boolean) => {
  // If(Value(UKC_Ship_Motions.Text) < Value(Required_UKC.Text), 5, 0)
  return UKCVesselMotions[showBarrass ? 0 : 1][0] < requiredUKC;
};
export const isUKCStraightUnderRequired = (requiredUKC: number, UKCStraightCourse: number[], showBarrass: boolean) => {
  // If(Value(UKC_Straight.Text) < Value(Required_UKC.Text), 5, 0)
  return UKCStraightCourse[showBarrass ? 0 : 1] < requiredUKC;
};
export const isUKCDuringTurnUnderRequired = (requiredUKC: number, UKCDuringTurn: number[], showBarrass: boolean) => {
  // If(Value(UKC_During_Turn.Text) < Value(Required_UKC.Text), 5, 0)
  return UKCDuringTurn[showBarrass ? 0 : 1] < requiredUKC;
};

// Field validation checks
export const isFieldValid = (name: string, validations: Record<string, boolean>) => {
  for (const [k, v] of Object.entries(validations)) {
    if (k === name) return v;
  }
  return undefined;
};
export const setFieldClass = (name: string, validations: Record<string, boolean>) => {
  if (isFieldValid(name, validations) === undefined) return '';
  return isFieldValid(name, validations) ? 'ion-valid' : 'ion-invalid';
};
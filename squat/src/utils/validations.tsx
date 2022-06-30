import React from 'react';
import { calculateFroudeNumber } from './calculations';
import i18n from '../i18n';
import { t } from 'i18next';

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

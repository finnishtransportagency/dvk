import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import {
  isBreadthDraughtRatioOutOfRange,
  isLengthBreadthRatioOutOfRange,
  isReliabilityAnIssue,
  isUKCStraightUnderRequired,
  isUKCUnderMinimum,
} from '../utils/validations';
import Alert from './Alert';
import {
  calculateDraughtDueWind,
  calculateDraughtDuringTurn,
  calculateHeelDueWind,
  calculateHeelDuringTurn,
  calculateSquatBarrass,
  calculateSquatHG,
  calculateUKCStraightCourse,
} from '../utils/calculations';

type CheckType = 'ukc' | 'reliability' | 'LBratio' | 'BDratio';

interface CalculationChecksProps {
  limitedView: boolean;
  embeddedView?: boolean;
  doChecks?: CheckType[];
}

const CalculationChecks: React.FC<CalculationChecksProps> = ({ limitedView, embeddedView, doChecks }) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squat.calculations' });
  const { state, dispatch } = useSquatContext();

  useEffect(() => {
    if (embeddedView) {
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
      const correctedDraughtDuringTurn = calculateDraughtDuringTurn(
        state.vessel.general.breadth,
        state.vessel.general.draught,
        constantHeelDuringTurn
      );

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
            UKCVesselMotions: [
              [0, 0],
              [0, 0],
            ],
            UKCStraightCourse: [UKCStraightCourseBarrass, UKCStraightCourseHG],
            UKCDuringTurn: [0, 0],
            squatBarrass: squatBarrass,
            squatHG: squatHG,
            squatHGListed: squatHGListed,
          },
          elType: 'object',
        },
      });
    }
  }, [
    embeddedView,
    state.vessel.general.lengthBPP,
    state.vessel.general.breadth,
    state.vessel.general.draught,
    state.vessel.general.displacement,
    state.vessel.general.blockCoefficient,
    state.vessel.detailed.windSurface,
    state.vessel.stability.KG,
    state.vessel.stability.GM,
    state.vessel.stability.KB,
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
    if (limitedView) {
      if (!state.environment.fairway.sweptDepth) {
        return false;
      }
      return isUKCStraightUnderRequired(
        state.environment.attribute.requiredUKC,
        state.calculations.squat.UKCStraightCourse,
        state.status.showBarrass
      );
    }
    return isUKCUnderMinimum(
      state.environment.fairway.sweptDepth,
      state.environment.attribute.requiredUKC,
      state.calculations.squat.UKCDuringTurn,
      state.calculations.squat.UKCStraightCourse,
      state.calculations.squat.UKCVesselMotions,
      state.status.showBarrass
    );
  };
  const checkIsLengthBreadthRatioOutOfRange = () => {
    return isLengthBreadthRatioOutOfRange(state.vessel.general.lengthBPP, state.vessel.general.breadth, state.status.showBarrass);
  };
  const checkIsBreadthDraughtRatioOutOfRange = () => {
    return isBreadthDraughtRatioOutOfRange(state.vessel.general.breadth, state.vessel.general.draught, state.status.showBarrass);
  };

  return (
    <>
      {doChecks?.includes('ukc') && checkIsUKCUnderMinimum() && <Alert alertType="error" title={t('UKC-under-required-minimum')} />}
      {doChecks?.includes('reliability') && checkIsReliabilityAnIssue() && (
        <Alert alertType="error" title={checkIsReliabilityAnIssue()} className="top-margin" />
      )}
      {doChecks?.includes('LBratio') && checkIsLengthBreadthRatioOutOfRange() && (
        <Alert alertType="error" title={checkIsLengthBreadthRatioOutOfRange()} className="top-margin" />
      )}
      {doChecks?.includes('BDratio') && checkIsBreadthDraughtRatioOutOfRange() && (
        <Alert alertType="error" title={checkIsBreadthDraughtRatioOutOfRange()} className="top-margin" />
      )}
    </>
  );
};

export default CalculationChecks;

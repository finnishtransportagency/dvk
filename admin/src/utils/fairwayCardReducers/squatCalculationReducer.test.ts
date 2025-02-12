import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';

test('if squat calculation place updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modplace1fi', 'squatCalculationPlace', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0].place.fi : '').toBe('modplace1fi');
  newState = fairwayCardReducer(testState, 'modplace1sv', 'squatCalculationPlace', emptyValidationParameters, 'sv', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0].place.sv : '').toBe('modplace1sv');
  newState = fairwayCardReducer(testState, 'modplace1en', 'squatCalculationPlace', emptyValidationParameters, 'en', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0].place.en : '').toBe('modplace1en');
});

test('if squat fairway list updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, [1, 2], 'squatTargetFairwayIds', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.targetFairways : '').toEqual([1, 2]);
});

test('if squat target area list updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, [11, 12], 'squatSuitableFairwayAreaIds', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.suitableFairwayAreas : '').toEqual([11, 12]);
});

test('if squat depth updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 99, 'squatCalculationDepth', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.depth : -1).toEqual(99);
});

test('if squat depth updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '88', 'squatCalculationEstimatedWaterDepth', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.estimatedWaterDepth : '').toEqual('88');
});

test('if squat fairway form updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 2, 'squatCalculationFairwayForm', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.fairwayForm : -1).toEqual(2);
});

test('if squat fairway width', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 1.9, 'squatCalculationFairwayWidth', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.fairwayWidth : -1).toEqual(1.9);
});

test('if squat slope scale', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 2.7, 'squatCalculationSlopeScale', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.slopeScale : -1).toEqual(2.7);
});

test('if squat height', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 14.2, 'squatCalculationSlopeHeight', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0]?.slopeHeight : -1).toEqual(14.2);
});

test('if squat additional info updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modaddinfo1fi', 'squatCalculationAdditionalInformation', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0].additionalInformation?.fi : '').toBe('modaddinfo1fi');
  newState = fairwayCardReducer(testState, 'modaddinfo1sv', 'squatCalculationAdditionalInformation', emptyValidationParameters, 'sv', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0].additionalInformation?.sv : '').toBe('modaddinfo1sv');
  newState = fairwayCardReducer(testState, 'modaddinfo1en', 'squatCalculationAdditionalInformation', emptyValidationParameters, 'en', 0, '');
  expect(newState.squatCalculations ? newState.squatCalculations[0].additionalInformation?.en : '').toBe('modaddinfo1en');
});

test('if squat list updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'y', 'squatCalculations', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations?.length).toBe(2);

  newState = fairwayCardReducer(testState, '', 'squatCalculations', emptyValidationParameters, 'fi', 0, '');
  expect(newState.squatCalculations?.length).toBe(0);
});

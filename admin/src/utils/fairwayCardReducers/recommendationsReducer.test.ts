import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';

test('if wind recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modwindfi', 'windRecommendation', emptyValidationParameters, 'fi', 0, '');
  expect(newState.windRecommendation?.fi).toBe('modwindfi');
  newState = fairwayCardReducer(testState, 'modwindsv', 'windRecommendation', emptyValidationParameters, 'sv', 0, '');
  expect(newState.windRecommendation?.sv).toBe('modwindsv');
  newState = fairwayCardReducer(testState, 'modwinden', 'windRecommendation', emptyValidationParameters, 'en', 0, '');
  expect(newState.windRecommendation?.en).toBe('modwinden');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modvesselfi', 'vesselRecommendation', emptyValidationParameters, 'fi', 0, '');
  expect(newState.vesselRecommendation?.fi).toBe('modvesselfi');
  newState = fairwayCardReducer(testState, 'modvesselsv', 'vesselRecommendation', emptyValidationParameters, 'sv', 0, '');
  expect(newState.vesselRecommendation?.sv).toBe('modvesselsv');
  newState = fairwayCardReducer(testState, 'modvesselen', 'vesselRecommendation', emptyValidationParameters, 'en', 0, '');
  expect(newState.vesselRecommendation?.en).toBe('modvesselen');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modvisibilityfi', 'visibility', emptyValidationParameters, 'fi', 0, '');
  expect(newState.visibility?.fi).toBe('modvisibilityfi');
  newState = fairwayCardReducer(testState, 'modvisibilitysv', 'visibility', emptyValidationParameters, 'sv', 0, '');
  expect(newState.visibility?.sv).toBe('modvisibilitysv');
  newState = fairwayCardReducer(testState, 'modvisibilityen', 'visibility', emptyValidationParameters, 'en', 0, '');
  expect(newState.visibility?.en).toBe('modvisibilityen');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, [10, 11, 12], 'mareographs', emptyValidationParameters, 'fi', 0, '');
  expect(newState.mareographs).toEqual([10, 11, 12]);
});

import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { getTestState } from '../fairwayCardReducer.test';

test('if wind recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modwindfi', 'windRecommendation', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.windRecommendation?.fi).toBe('modwindfi');
  newState = fairwayCardReducer(testState, 'modwindsv', 'windRecommendation', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.windRecommendation?.sv).toBe('modwindsv');
  newState = fairwayCardReducer(testState, 'modwinden', 'windRecommendation', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.windRecommendation?.en).toBe('modwinden');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(
    testState,
    'modvesselfi',
    'vesselRecommendation',
    [],
    (validationErrors: ValidationType[]) => {},
    'fi',
    0,
    '',
    []
  );
  expect(newState.vesselRecommendation?.fi).toBe('modvesselfi');
  newState = fairwayCardReducer(testState, 'modvesselsv', 'vesselRecommendation', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.vesselRecommendation?.sv).toBe('modvesselsv');
  newState = fairwayCardReducer(testState, 'modvesselen', 'vesselRecommendation', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.vesselRecommendation?.en).toBe('modvesselen');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modvisibilityfi', 'visibility', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.visibility?.fi).toBe('modvisibilityfi');
  newState = fairwayCardReducer(testState, 'modvisibilitysv', 'visibility', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.visibility?.sv).toBe('modvisibilitysv');
  newState = fairwayCardReducer(testState, 'modvisibilityen', 'visibility', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.visibility?.en).toBe('modvisibilityen');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, [10, 11, 12], 'mareographs', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.mareographs).toEqual([10, 11, 12]);
});

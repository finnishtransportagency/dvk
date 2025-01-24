import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

test('if wind recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modwindfi', 'windRecommendation', [], () => {}, 'fi', 0, '', []);
  expect(newState.windRecommendation?.fi).toBe('modwindfi');
  newState = fairwayCardReducer(testState, 'modwindsv', 'windRecommendation', [], () => {}, 'sv', 0, '', []);
  expect(newState.windRecommendation?.sv).toBe('modwindsv');
  newState = fairwayCardReducer(testState, 'modwinden', 'windRecommendation', [], () => {}, 'en', 0, '', []);
  expect(newState.windRecommendation?.en).toBe('modwinden');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modvesselfi', 'vesselRecommendation', [], () => {}, 'fi', 0, '', []);
  expect(newState.vesselRecommendation?.fi).toBe('modvesselfi');
  newState = fairwayCardReducer(testState, 'modvesselsv', 'vesselRecommendation', [], () => {}, 'sv', 0, '', []);
  expect(newState.vesselRecommendation?.sv).toBe('modvesselsv');
  newState = fairwayCardReducer(testState, 'modvesselen', 'vesselRecommendation', [], () => {}, 'en', 0, '', []);
  expect(newState.vesselRecommendation?.en).toBe('modvesselen');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modvisibilityfi', 'visibility', [], () => {}, 'fi', 0, '', []);
  expect(newState.visibility?.fi).toBe('modvisibilityfi');
  newState = fairwayCardReducer(testState, 'modvisibilitysv', 'visibility', [], () => {}, 'sv', 0, '', []);
  expect(newState.visibility?.sv).toBe('modvisibilitysv');
  newState = fairwayCardReducer(testState, 'modvisibilityen', 'visibility', [], () => {}, 'en', 0, '', []);
  expect(newState.visibility?.en).toBe('modvisibilityen');
});

test('if vessel recommendation updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, [10, 11, 12], 'mareographs', [], () => {}, 'fi', 0, '', []);
  expect(newState.mareographs).toEqual([10, 11, 12]);
});

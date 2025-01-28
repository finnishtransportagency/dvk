import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modlinefi', 'line', emptyValidationParameters, 'fi', 0, '');
  expect(newState.lineText?.fi).toBe('modlinefi');
  newState = fairwayCardReducer(testState, 'modlinesv', 'line', emptyValidationParameters, 'sv', 0, '');
  expect(newState.lineText?.sv).toBe('modlinesv');
  newState = fairwayCardReducer(testState, 'modlineen', 'line', emptyValidationParameters, 'en', 0, '');
  expect(newState.lineText?.en).toBe('modlineen');
});

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modspeedlimitfi', 'speedLimit', emptyValidationParameters, 'fi', 0, '');
  expect(newState.speedLimit?.fi).toBe('modspeedlimitfi');
  newState = fairwayCardReducer(testState, 'modspeedlimitsv', 'speedLimit', emptyValidationParameters, 'sv', 0, '');
  expect(newState.speedLimit?.sv).toBe('modspeedlimitsv');
  newState = fairwayCardReducer(testState, 'modspeedlimiten', 'speedLimit', emptyValidationParameters, 'en', 0, '');
  expect(newState.speedLimit?.en).toBe('modspeedlimiten');
});

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'moddesignspeedfi', 'designSpeed', emptyValidationParameters, 'fi', 0, '');
  expect(newState.designSpeed?.fi).toBe('moddesignspeedfi');
  newState = fairwayCardReducer(testState, 'moddesignspeedsv', 'designSpeed', emptyValidationParameters, 'sv', 0, '');
  expect(newState.designSpeed?.sv).toBe('moddesignspeedsv');
  newState = fairwayCardReducer(testState, 'moddesignspeeden', 'designSpeed', emptyValidationParameters, 'en', 0, '');
  expect(newState.designSpeed?.en).toBe('moddesignspeeden');
});

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modanchoragefi', 'anchorage', emptyValidationParameters, 'fi', 0, '');
  expect(newState.anchorage?.fi).toBe('modanchoragefi');
  newState = fairwayCardReducer(testState, 'modanchoragesv', 'anchorage', emptyValidationParameters, 'sv', 0, '');
  expect(newState.anchorage?.sv).toBe('modanchoragesv');
  newState = fairwayCardReducer(testState, 'modanchorageen', 'anchorage', emptyValidationParameters, 'en', 0, '');
  expect(newState.anchorage?.en).toBe('modanchorageen');
});

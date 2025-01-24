import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { getTestState } from '../fairwayCardReducer.test';

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modlinefi', 'line', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.lineText?.fi).toBe('modlinefi');
  newState = fairwayCardReducer(testState, 'modlinesv', 'line', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.lineText?.sv).toBe('modlinesv');
  newState = fairwayCardReducer(testState, 'modlineen', 'line', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.lineText?.en).toBe('modlineen');
});

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modspeedlimitfi', 'speedLimit', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.speedLimit?.fi).toBe('modspeedlimitfi');
  newState = fairwayCardReducer(testState, 'modspeedlimitsv', 'speedLimit', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.speedLimit?.sv).toBe('modspeedlimitsv');
  newState = fairwayCardReducer(testState, 'modspeedlimiten', 'speedLimit', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.speedLimit?.en).toBe('modspeedlimiten');
});

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'moddesignspeedfi', 'designSpeed', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.designSpeed?.fi).toBe('moddesignspeedfi');
  newState = fairwayCardReducer(testState, 'moddesignspeedsv', 'designSpeed', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.designSpeed?.sv).toBe('moddesignspeedsv');
  newState = fairwayCardReducer(testState, 'moddesignspeeden', 'designSpeed', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.designSpeed?.en).toBe('moddesignspeeden');
});

test('if line text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modanchoragefi', 'anchorage', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.anchorage?.fi).toBe('modanchoragefi');
  newState = fairwayCardReducer(testState, 'modanchoragesv', 'anchorage', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.anchorage?.sv).toBe('modanchoragesv');
  newState = fairwayCardReducer(testState, 'modanchorageen', 'anchorage', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.anchorage?.en).toBe('modanchorageen');
});

import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { getTestState } from '../fairwayCardReducer.test';

test('if navigation condition text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modlinefi', 'navigationCondition', [], () => {}, 'fi', 0, '', []);
  expect(newState.navigationCondition?.fi).toBe('modlinefi');
  newState = fairwayCardReducer(testState, 'modlinesv', 'navigationCondition', [], () => {}, 'sv', 0, '', []);
  expect(newState.navigationCondition?.sv).toBe('modlinesv');
  newState = fairwayCardReducer(testState, 'modlineen', 'navigationCondition', [], () => {}, 'en', 0, '', []);
  expect(newState.navigationCondition?.en).toBe('modlineen');
});

test('if ice condition text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modspeedlimitfi', 'iceCondition', [], () => {}, 'fi', 0, '', []);
  expect(newState.iceCondition?.fi).toBe('modspeedlimitfi');
  newState = fairwayCardReducer(testState, 'modspeedlimitsv', 'iceCondition', [], () => {}, 'sv', 0, '', []);
  expect(newState.iceCondition?.sv).toBe('modspeedlimitsv');
  newState = fairwayCardReducer(testState, 'modspeedlimiten', 'iceCondition', [], () => {}, 'en', 0, '', []);
  expect(newState.iceCondition?.en).toBe('modspeedlimiten');
});

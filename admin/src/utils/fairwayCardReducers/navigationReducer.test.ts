import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';

test('if navigation condition text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modlinefi', 'navigationCondition', emptyValidationParameters, 'fi', 0, '');
  expect(newState.navigationCondition?.fi).toBe('modlinefi');
  newState = fairwayCardReducer(testState, 'modlinesv', 'navigationCondition', emptyValidationParameters, 'sv', 0, '');
  expect(newState.navigationCondition?.sv).toBe('modlinesv');
  newState = fairwayCardReducer(testState, 'modlineen', 'navigationCondition', emptyValidationParameters, 'en', 0, '');
  expect(newState.navigationCondition?.en).toBe('modlineen');
});

test('if ice condition text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modspeedlimitfi', 'iceCondition', emptyValidationParameters, 'fi', 0, '');
  expect(newState.iceCondition?.fi).toBe('modspeedlimitfi');
  newState = fairwayCardReducer(testState, 'modspeedlimitsv', 'iceCondition', emptyValidationParameters, 'sv', 0, '');
  expect(newState.iceCondition?.sv).toBe('modspeedlimitsv');
  newState = fairwayCardReducer(testState, 'modspeedlimiten', 'iceCondition', emptyValidationParameters, 'en', 0, '');
  expect(newState.iceCondition?.en).toBe('modspeedlimiten');
});

import { harbourReducer } from '../harbourReducer';
import { emptyValidationParameters, getTestState } from '../harbourReducer.test';

test('if quay list updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'y', 'quay', emptyValidationParameters, 'fi', 0, '');
  expect(newState.quays?.length).toBe(2);

  newState = harbourReducer(testState, '', 'quay', emptyValidationParameters, 'fi', 0, '');
  expect(newState.quays?.length).toBe(0);
});

test('if quay name updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modquaynamefi', 'quayName', emptyValidationParameters, 'fi', 0, '');
  expect(newState.quays ? newState.quays[0]?.name?.fi : '').toEqual('modquaynamefi');
  newState = harbourReducer(testState, 'modquaynamesv', 'quayName', emptyValidationParameters, 'sv', 0, '');
  expect(newState.quays ? newState.quays[0]?.name?.sv : '').toEqual('modquaynamesv');
  newState = harbourReducer(testState, 'modquaynameen', 'quayName', emptyValidationParameters, 'en', 0, '');
  expect(newState.quays ? newState.quays[0]?.name?.en : '').toEqual('modquaynameen');
});

test('if quay extra info updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modquayinfofi', 'quayExtraInfo', emptyValidationParameters, 'fi', 0, '');
  expect(newState.quays ? newState.quays[0]?.extraInfo?.fi : '').toEqual('modquayinfofi');
  newState = harbourReducer(testState, 'modquayinfosv', 'quayExtraInfo', emptyValidationParameters, 'sv', 0, '');
  expect(newState.quays ? newState.quays[0]?.extraInfo?.sv : '').toEqual('modquayinfosv');
  newState = harbourReducer(testState, 'modquayinfoen', 'quayExtraInfo', emptyValidationParameters, 'en', 0, '');
  expect(newState.quays ? newState.quays[0]?.extraInfo?.en : '').toEqual('modquayinfoen');
});

test('if quay length updates correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, '11', 'quayLength', emptyValidationParameters, 'fi', 0, '');
  expect(newState.quays ? newState.quays[0]?.length : '').toEqual('11');
});

test('if quay lat update correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, '21.1', 'quayLat', emptyValidationParameters, 'fi', 0, '');
  expect(newState.quays ? newState.quays[0]?.geometry?.lat : '').toEqual('21.1');
  expect(newState.quays ? newState.quays[0]?.geometry?.lon : '').toEqual('60.1');
});

test('if quay lon update correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, '59.1', 'quayLon', emptyValidationParameters, 'fi', 0, '');
  expect(newState.quays ? newState.quays[0]?.geometry?.lat : '').toEqual('20.1');
  expect(newState.quays ? newState.quays[0]?.geometry?.lon : '').toEqual('59.1');
});

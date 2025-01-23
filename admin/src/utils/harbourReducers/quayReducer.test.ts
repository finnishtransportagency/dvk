import { ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { testState } from '../harbourReducer.test';

test('if quay list updates correctly', () => {
  let newState = harbourReducer(testState, 'y', 'quay', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.quays?.length).toBe(2);

  newState = harbourReducer(testState, '', 'quay', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.quays?.length).toBe(0);
});

test('if quay name updates correctly', () => {
  let newState = harbourReducer(testState, 'modquaynamefi', 'quayName', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.name?.fi : '').toEqual('modquaynamefi');
  newState = harbourReducer(testState, 'modquaynamesv', 'quayName', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.name?.sv : '').toEqual('modquaynamesv');
  newState = harbourReducer(testState, 'modquaynameen', 'quayName', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.name?.en : '').toEqual('modquaynameen');
});

test('if quay extra info updates correctly', () => {
  let newState = harbourReducer(testState, 'modquayinfofi', 'quayExtraInfo', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.extraInfo?.fi : '').toEqual('modquayinfofi');
  newState = harbourReducer(testState, 'modquayinfosv', 'quayExtraInfo', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.extraInfo?.sv : '').toEqual('modquayinfosv');
  newState = harbourReducer(testState, 'modquayinfoen', 'quayExtraInfo', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.extraInfo?.en : '').toEqual('modquayinfoen');
});

test('if quay length updates correctly', () => {
  let newState = harbourReducer(testState, '11', 'quayLength', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  console.log(newState);
  expect(newState.quays ? newState.quays[0]?.length : '').toEqual('11');
});

test('if quay lat update correctly', () => {
  const newState = harbourReducer(testState, '21.1', 'quayLat', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.geometry?.lat : '').toEqual('21.1');
  expect(newState.quays ? newState.quays[0]?.geometry?.lon : '').toEqual('60.1');
});

test('if quay lon update correctly', () => {
  const newState = harbourReducer(testState, '59.1', 'quayLon', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.geometry?.lat : '').toEqual('20.1');
  expect(newState.quays ? newState.quays[0]?.geometry?.lon : '').toEqual('59.1');
});

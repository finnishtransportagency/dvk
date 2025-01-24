import { ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { getTestState } from '../harbourReducer.test';

test('if quay list updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'y', 'quay', [], () => {}, 'fi', 0, '', []);
  expect(newState.quays?.length).toBe(2);

  newState = harbourReducer(testState, '', 'quay', [], () => {}, 'fi', 0, '', []);
  expect(newState.quays?.length).toBe(0);
});

test('if quay name updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modquaynamefi', 'quayName', [], () => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.name?.fi : '').toEqual('modquaynamefi');
  newState = harbourReducer(testState, 'modquaynamesv', 'quayName', [], () => {}, 'sv', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.name?.sv : '').toEqual('modquaynamesv');
  newState = harbourReducer(testState, 'modquaynameen', 'quayName', [], () => {}, 'en', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.name?.en : '').toEqual('modquaynameen');
});

test('if quay extra info updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modquayinfofi', 'quayExtraInfo', [], () => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.extraInfo?.fi : '').toEqual('modquayinfofi');
  newState = harbourReducer(testState, 'modquayinfosv', 'quayExtraInfo', [], () => {}, 'sv', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.extraInfo?.sv : '').toEqual('modquayinfosv');
  newState = harbourReducer(testState, 'modquayinfoen', 'quayExtraInfo', [], () => {}, 'en', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.extraInfo?.en : '').toEqual('modquayinfoen');
});

test('if quay length updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, '11', 'quayLength', [], () => {}, 'fi', 0, '', []);
  console.log(newState);
  expect(newState.quays ? newState.quays[0]?.length : '').toEqual('11');
});

test('if quay lat update correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, '21.1', 'quayLat', [], () => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.geometry?.lat : '').toEqual('21.1');
  expect(newState.quays ? newState.quays[0]?.geometry?.lon : '').toEqual('60.1');
});

test('if quay lon update correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, '59.1', 'quayLon', [], () => {}, 'fi', 0, '', []);
  expect(newState.quays ? newState.quays[0]?.geometry?.lat : '').toEqual('20.1');
  expect(newState.quays ? newState.quays[0]?.geometry?.lon : '').toEqual('59.1');
});

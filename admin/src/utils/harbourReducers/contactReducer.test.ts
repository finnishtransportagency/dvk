import { harbourReducer } from '../harbourReducer';
import { emptyValidationParameters, getTestState } from '../harbourReducer.test';

test('if company name updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modcompnamefi', 'companyName', emptyValidationParameters, 'fi', '', '');
  expect(newState.company?.fi).toEqual('modcompnamefi');
  newState = harbourReducer(testState, 'modcompnamesv', 'companyName', emptyValidationParameters, 'sv', '', '');
  expect(newState.company?.sv).toEqual('modcompnamesv');
  newState = harbourReducer(testState, 'modcompnameen', 'companyName', emptyValidationParameters, 'en', '', '');
  expect(newState.company?.en).toEqual('modcompnameen');
});

test('if email updates correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, 'harbour@hotmail.com', 'email', emptyValidationParameters, 'fi', '', '');
  expect(newState.email).toEqual('harbour@hotmail.com');
});

test('if phone number updates correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, ' 0123 , 0456 ', 'phoneNumber', emptyValidationParameters, 'fi', '', '');
  expect(newState.phoneNumber).toEqual(['0123', '0456']);
});

test('if internet address updates correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, 'www.harbours.com', 'internet', emptyValidationParameters, 'fi', '', '');
  expect(newState.internet).toEqual('www.harbours.com');
});

test('if lat update correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, '21', 'lat', emptyValidationParameters, 'fi', '', '');
  expect(newState.geometry.lat).toEqual('21');
  expect(newState.geometry.lon).toEqual('60');
});

test('if lon update correctly', () => {
  const testState = getTestState();
  const newState = harbourReducer(testState, '59', 'lon', emptyValidationParameters, 'fi', '', '');
  expect(newState.geometry.lat).toEqual('20');
  expect(newState.geometry.lon).toEqual('59');
});

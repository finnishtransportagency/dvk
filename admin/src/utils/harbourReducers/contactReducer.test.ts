import { ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { testState } from '../harbourReducer.test';

test('if company name updates correctly', () => {
  let newState = harbourReducer(testState, 'modcompnamefi', 'companyName', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.company?.fi).toEqual('modcompnamefi');
  newState = harbourReducer(testState, 'modcompnamesv', 'companyName', [], (validationErrors: ValidationType[]) => {}, 'sv', '', '', []);
  expect(newState.company?.sv).toEqual('modcompnamesv');
  newState = harbourReducer(testState, 'modcompnameen', 'companyName', [], (validationErrors: ValidationType[]) => {}, 'en', '', '', []);
  expect(newState.company?.en).toEqual('modcompnameen');
});

test('if email updates correctly', () => {
  const newState = harbourReducer(testState, 'harbour@hotmail.com', 'email', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.email).toEqual('harbour@hotmail.com');
});

test('if phone number updates correctly', () => {
  const newState = harbourReducer(testState, ' 0123 , 0456 ', 'phoneNumber', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.phoneNumber).toEqual(['0123', '0456']);
});

test('if internet address updates correctly', () => {
  const newState = harbourReducer(testState, 'www.harbours.com', 'internet', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.internet).toEqual('www.harbours.com');
});

test('if lat update correctly', () => {
  const newState = harbourReducer(testState, '21', 'lat', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.geometry.lat).toEqual('21');
  expect(newState.geometry.lon).toEqual('60');
});

test('if lon update correctly', () => {
  const newState = harbourReducer(testState, '59', 'lon', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.geometry.lat).toEqual('20');
  expect(newState.geometry.lon).toEqual('59');
});

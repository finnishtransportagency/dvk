import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';

test('if tug name updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modtug1fi', 'tugName', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.fi : '').toBe('modtug1fi');
  newState = fairwayCardReducer(testState, 'modtug1sv', 'tugName', emptyValidationParameters, 'sv', 0, '');
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.sv : '').toBe('modtug1sv');
  newState = fairwayCardReducer(testState, 'modtug1en', 'tugName', emptyValidationParameters, 'en', 0, '');
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.en : '').toBe('modtug1en');
});

test('if email updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'modtug1@gmail.com', 'tugEmail', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.email : '').toBe('modtug1@gmail.com');
});

test('if phone number updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '0234567890,0345678901', 'tugPhone', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.phoneNumber : '').toEqual(['0234567890', '0345678901']);
});

test('if fax updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '000222333', 'tugFax', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.fax : '').toStrictEqual('000222333');
});

test('if tug list updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'y', 'tug', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.tugs?.length).toBe(2);

  newState = fairwayCardReducer(testState, '', 'tug', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.tugs?.length).toBe(0);
});

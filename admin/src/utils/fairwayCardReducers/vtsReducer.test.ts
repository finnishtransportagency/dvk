import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';

test('if vts name updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modvts1fi', 'vtsName', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.name.fi : '').toBe('modvts1fi');
  newState = fairwayCardReducer(testState, 'modvts1sv', 'vtsName', emptyValidationParameters, 'sv', 0, '');
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.name.sv : '').toBe('modvts1sv');
  newState = fairwayCardReducer(testState, 'modvts1en', 'vtsName', emptyValidationParameters, 'en', 0, '');
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.name.en : '').toBe('modvts1en');
});

test('if email updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'modvts1@gmail.com', 'vtsEmail', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.email : '').toEqual(['modvts1@gmail.com']);
});

test('if phone number updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '0334567890', 'vtsPhone', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.phoneNumber : '').toEqual('0334567890');
});

test('if vts list updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'y', 'vts', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.vts?.length).toBe(2);

  newState = fairwayCardReducer(testState, '', 'vts', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.vts?.length).toBe(0);
});

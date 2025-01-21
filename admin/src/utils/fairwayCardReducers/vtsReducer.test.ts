import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { testState } from '../fairwayCardReducer.test';

test('if vts name updates correctly', () => {
  let newState = fairwayCardReducer(testState, 'modvts1fi', 'vtsName', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.name.fi : '').toBe('modvts1fi');
  newState = fairwayCardReducer(testState, 'modvts1sv', 'vtsName', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.name.sv : '').toBe('modvts1sv');
  newState = fairwayCardReducer(testState, 'modvts1en', 'vtsName', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.name.en : '').toBe('modvts1en');
});

test('if email updates correctly', () => {
  const newState = fairwayCardReducer(testState, 'modvts1@gmail.com', 'vtsEmail', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.email : '').toEqual(['modvts1@gmail.com']);
});

test('if phone number updates correctly', () => {
  const newState = fairwayCardReducer(testState, '0334567890', 'vtsPhone', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.vts ? newState.trafficService?.vts[0]?.phoneNumber : '').toEqual('0334567890');
});

test('if vts list updates correctly', () => {
  let newState = fairwayCardReducer(testState, 'y', 'vts', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.vts?.length).toBe(2);

  newState = fairwayCardReducer(testState, '', 'vts', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.vts?.length).toBe(0);
});

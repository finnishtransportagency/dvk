import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

test('if tug name updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modtug1fi', 'tugName', [], () => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.fi : '').toBe('modtug1fi');
  newState = fairwayCardReducer(testState, 'modtug1sv', 'tugName', [], () => {}, 'sv', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.sv : '').toBe('modtug1sv');
  newState = fairwayCardReducer(testState, 'modtug1en', 'tugName', [], () => {}, 'en', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.en : '').toBe('modtug1en');
});

test('if email updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'modtug1@gmail.com', 'tugEmail', [], () => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.email : '').toBe('modtug1@gmail.com');
});

test('if phone number updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '0234567890,0345678901', 'tugPhone', [], () => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.phoneNumber : '').toEqual(['0234567890', '0345678901']);
});

test('if fax updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '000222333', 'tugFax', [], () => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.fax : '').toStrictEqual('000222333');
});

test('if tug list updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'y', 'tug', [], () => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs?.length).toBe(2);

  newState = fairwayCardReducer(testState, '', 'tug', [], () => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs?.length).toBe(0);
});

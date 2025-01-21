import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { testState } from '../fairwayCardReducer.test';

test('if tug name updates correctly', () => {
  let newState = fairwayCardReducer(testState, 'modtug1fi', 'tugName', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.fi : '').toBe('modtug1fi');
  newState = fairwayCardReducer(testState, 'modtug1sv', 'tugName', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.sv : '').toBe('modtug1sv');
  newState = fairwayCardReducer(testState, 'modtug1en', 'tugName', [], (validationErrors: ValidationType[]) => {}, 'en', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.name.en : '').toBe('modtug1en');
});

test('if email updates correctly', () => {
  const newState = fairwayCardReducer(testState, 'modtug1@gmail.com', 'tugEmail', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.email : '').toBe('modtug1@gmail.com');
});

test('if phone number updates correctly', () => {
  const newState = fairwayCardReducer(
    testState,
    '0234567890,0345678901',
    'tugPhone',
    [],
    (validationErrors: ValidationType[]) => {},
    'fi',
    0,
    '',
    []
  );
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.phoneNumber : '').toEqual(['0234567890', '0345678901']);
});

test('if fax updates correctly', () => {
  const newState = fairwayCardReducer(testState, '000222333', 'tugFax', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs ? newState.trafficService?.tugs[0]?.fax : '').toStrictEqual('000222333');
});

test('if tug list updates correctly', () => {
  let newState = fairwayCardReducer(testState, 'y', 'tug', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs?.length).toBe(2);

  newState = fairwayCardReducer(testState, '', 'tug', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, '', []);
  expect(newState.trafficService?.tugs?.length).toBe(0);
});

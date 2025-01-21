import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { testState } from '../fairwayCardReducer.test';

test('if vhf name updates correctly', () => {
  let newState = fairwayCardReducer(testState, 'modvhf1fi', 'vhfName', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (!newState.trafficService?.vts) {
    fail();
  } else if (!newState.trafficService?.vts[0]?.vhf) {
    fail();
  } else {
    expect(newState.trafficService?.vts[0]?.vhf[0]?.name?.fi).toBe('modvhf1fi');
  }

  newState = fairwayCardReducer(testState, 'modvhf1sv', 'vhfName', [], (validationErrors: ValidationType[]) => {}, 'sv', 0, 0, []);
  if (!newState.trafficService?.vts) {
    fail();
  } else if (!newState.trafficService?.vts[0]?.vhf) {
    fail();
  } else {
    expect(newState.trafficService?.vts[0]?.vhf[0]?.name?.sv).toBe('modvhf1sv');
  }

  newState = fairwayCardReducer(testState, 'modvhf1en', 'vhfName', [], (validationErrors: ValidationType[]) => {}, 'en', 0, 0, []);
  if (!newState.trafficService?.vts) {
    fail();
  } else if (!newState.trafficService?.vts[0]?.vhf) {
    fail();
  } else {
    expect(newState.trafficService?.vts[0]?.vhf[0]?.name?.en).toBe('modvhf1en');
  }
});

test('if vhf channel correctly', () => {
  const newState = fairwayCardReducer(testState, 'modchannel1', 'vhfChannel', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (!newState.trafficService?.vts) {
    fail();
  } else if (!newState.trafficService?.vts[0]?.vhf) {
    fail();
  } else {
    expect(newState.trafficService?.vts[0]?.vhf[0]?.channel).toBe('modchannel1');
  }
});

test('if vhf list updates correctly', () => {
  let newState = fairwayCardReducer(testState, 'y', 'vhf', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (newState.trafficService?.vts) {
    expect(newState.trafficService?.vts[0]?.vhf?.length).toBe(2);
  } else {
    fail();
  }

  newState = fairwayCardReducer(testState, '', 'vhf', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (newState.trafficService?.vts) {
    expect(newState.trafficService?.vts[0]?.vhf?.length).toBe(0);
  } else {
    fail();
  }
});

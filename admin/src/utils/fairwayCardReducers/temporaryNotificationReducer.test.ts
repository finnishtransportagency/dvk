import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { getTestState } from '../fairwayCardReducer.test';

test('if temporary notification content updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modnote1fi', 'temporaryNotificationContent', [], () => {}, 'fi', 0, '', []);
  expect(newState.temporaryNotifications ? newState.temporaryNotifications[0]?.content.fi : '').toBe('modnote1fi');
  newState = fairwayCardReducer(testState, 'modnote1sv', 'temporaryNotificationContent', [], () => {}, 'sv', 0, '', []);
  expect(newState.temporaryNotifications ? newState.temporaryNotifications[0]?.content.sv : '').toBe('modnote1sv');
  newState = fairwayCardReducer(testState, 'modnote1en', 'temporaryNotificationContent', [], () => {}, 'en', 0, '', []);
  expect(newState.temporaryNotifications ? newState.temporaryNotifications[0]?.content.en : '').toBe('modnote1en');
});

test('if temporary notification start date updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '02022002', 'temporaryNotificationStartDate', [], () => {}, 'fi', 0, '', []);
  expect(newState.temporaryNotifications ? newState.temporaryNotifications[0]?.startDate : '').toEqual('02022002');
});

test('if temporary notification start date updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '11112011', 'temporaryNotificationEndDate', [], () => {}, 'fi', 0, '', []);
  expect(newState.temporaryNotifications ? newState.temporaryNotifications[0]?.endDate : '').toEqual('11112011');
});

test('if temporaryNotifications list updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'y', 'temporaryNotifications', [], () => {}, 'fi', 0, '', []);
  expect(newState.temporaryNotifications?.length).toBe(2);

  newState = fairwayCardReducer(testState, '', 'temporaryNotifications', [], () => {}, 'fi', 0, '', []);
  expect(newState.temporaryNotifications?.length).toBe(0);
});

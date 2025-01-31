import { getNotificationListingTypeString, getSelectedItemsAsText, isReadOnly } from './common';
import { FairwayCardInput, HarborInput, Status, Operation, TemporaryNotification } from '../graphql/generated';
import { SelectOption } from './constants';

function getTestHarborWithStatus(status: Status) {
  const harbor: HarborInput = {
    id: 'a1',
    version: 'v2',
    name: { fi: 'test', sv: 'testsv', en: 'testen' },
    n2000HeightSystem: false,
    operation: Operation.Create,
    geometry: { lat: '60', lon: '20' },
    status: status,
  };
  return harbor;
}

function getTestFairwayCardWithStatus(status: Status) {
  const fairwayCard: FairwayCardInput = {
    id: 'test',
    version: 'v0',
    name: { fi: 'test2', sv: 'testsv2', en: 'testen2' },
    n2000HeightSystem: true,
    operation: Operation.Update,
    status: status,
    group: '1',
    fairwayIds: [1],
  };
  return fairwayCard;
}

test('should calculate readonly correctly for states', () => {
  expect(isReadOnly(getTestHarborWithStatus(Status.Draft))).toBeFalsy();
  expect(isReadOnly(getTestHarborWithStatus(Status.Archived))).toBeTruthy();
  expect(isReadOnly(getTestHarborWithStatus(Status.Public))).toBeTruthy();
  expect(isReadOnly(getTestHarborWithStatus(Status.Removed))).toBeTruthy();

  expect(isReadOnly(getTestFairwayCardWithStatus(Status.Draft))).toBeFalsy();
  expect(isReadOnly(getTestFairwayCardWithStatus(Status.Archived))).toBeTruthy();
  expect(isReadOnly(getTestFairwayCardWithStatus(Status.Public))).toBeTruthy();
  expect(isReadOnly(getTestFairwayCardWithStatus(Status.Removed))).toBeTruthy();
});

test('should generate input text for selected values', () => {
  let one: SelectOption = { id: 1, name: { fi: 'yksi', sv: 'en', en: 'one' } };
  let two: SelectOption = { id: 2, name: { fi: 'kaksi', sv: 'två', en: 'two' } };

  expect(getSelectedItemsAsText([one, two], 1, 'fi')).toBe('yksi');
  expect(getSelectedItemsAsText([one, two], 1, 'sv')).toBe('en');
  expect(getSelectedItemsAsText([one, two], 1, 'en')).toBe('one');
  expect(getSelectedItemsAsText([one, two], 2, 'fi')).toBe('kaksi');
  expect(getSelectedItemsAsText([one, two], 2, 'sv')).toBe('två');
  expect(getSelectedItemsAsText([one, two], 2, 'en')).toBe('two');
  expect(getSelectedItemsAsText([one, two], [1, 2], 'en', ',')).toBe('one,two');

  one = { id: '1', name: { fi: 'yksi', sv: 'en', en: 'one' } };
  two = { id: '2', name: { fi: 'kaksi', sv: 'två', en: 'two' } };

  expect(getSelectedItemsAsText([one, two], '1', 'fi')).toBe('yksi');
  expect(getSelectedItemsAsText([one, two], '1', 'sv')).toBe('en');
  expect(getSelectedItemsAsText([one, two], '1', 'en')).toBe('one');
  expect(getSelectedItemsAsText([one, two], '2', 'fi')).toBe('kaksi');
  expect(getSelectedItemsAsText([one, two], '2', 'sv')).toBe('två');
  expect(getSelectedItemsAsText([one, two], '2', 'en')).toBe('two');
  expect(getSelectedItemsAsText([one, two], ['1', '2'], 'en', ',')).toBe('one,two');

  one = { id: true, name: { fi: 'yksi', sv: 'en', en: 'one' } };
  two = { id: false, name: { fi: 'kaksi', sv: 'två', en: 'two' } };

  expect(getSelectedItemsAsText([one, two], true, 'fi')).toBe('yksi');
  expect(getSelectedItemsAsText([one, two], true, 'sv')).toBe('en');
  expect(getSelectedItemsAsText([one, two], true, 'en')).toBe('one');
  expect(getSelectedItemsAsText([one, two], false, 'fi')).toBe('kaksi');
  expect(getSelectedItemsAsText([one, two], false, 'sv')).toBe('två');
  expect(getSelectedItemsAsText([one, two], false, 'en')).toBe('two');
});

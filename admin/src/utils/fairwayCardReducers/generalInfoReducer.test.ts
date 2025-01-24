import { fairwayCardReducer } from '../fairwayCardReducer';
import { ValidationType } from '../constants';
import { getTestState } from '../fairwayCardReducer.test';
import { SelectedFairwayInput, Status } from '../../graphql/generated';

test('if name updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modifiednamefi', 'name', [], () => {}, 'fi', '', '', []);
  expect(newState.name.fi).toEqual('modifiednamefi');
  newState = fairwayCardReducer(testState, 'modifiednamesv', 'name', [], () => {}, 'sv', '', '', []);
  expect(newState.name.sv).toEqual('modifiednamesv');
  newState = fairwayCardReducer(testState, 'modifiednameen', 'name', [], () => {}, 'en', '', '', []);
  expect(newState.name.en).toEqual('modifiednameen');
});

test('if primary id updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'ModifiedId', 'primaryId', [], () => {}, 'fi', '', '', []);
  expect(newState.id).toEqual('ModifiedId'.toLowerCase());
});

test('if status updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, Status.Public, 'status', [], () => {}, 'fi', '', '', []);
  expect(newState.status).toEqual(Status.Public);
});

test('if fairway ids update correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, [2, 3], 'fairwayIds', [], () => {}, 'fi', '', '', []);
  expect(newState.fairwayIds).toEqual([2, 3]);
  expect(newState.primaryFairwayId).toEqual([{ id: 2, sequenceNumber: 1 }]);
  expect(newState.secondaryFairwayId).toEqual([
    { id: 2, sequenceNumber: 2 },
    { id: 3, sequenceNumber: 1 },
  ]);
});

test('if primary ids update correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(
    testState,
    [{ id: 2, sequenceNumber: 2 } as SelectedFairwayInput],
    'fairwayPrimary',
    [],
    () => {},
    'fi',
    '',
    '',
    []
  );
  expect(newState.primaryFairwayId).toEqual([{ id: 2, sequenceNumber: 2 } as SelectedFairwayInput]);
});

test('if secondary ids update correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(
    testState,
    [{ id: 3, sequenceNumber: 1 } as SelectedFairwayInput],
    'fairwaySecondary',
    [],
    () => {},
    'fi',
    '',
    '',
    []
  );
  expect(newState.secondaryFairwayId).toEqual([{ id: 3, sequenceNumber: 1 } as SelectedFairwayInput]);
});

test('if secondary ids update correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, ['c', 'd'], 'harbours', [], () => {}, 'fi', '', '', []);
  expect(newState.harbors).toEqual(['c', 'd']);
});

test('if pilotRoutes update correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, [5, 6], 'pilotRoutes', [], () => {}, 'fi', '', '', []);
  expect(newState.pilotRoutes).toEqual([5, 6]);
});

test('if group/sea area updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'baltic', 'group', [], () => {}, 'fi', '', '', []);
  expect(newState.group).toEqual('baltic');
});

test('if reference level updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, true, 'referenceLevel', [], () => {}, 'fi', '', '', []);
  expect(newState.n2000HeightSystem).toBeTruthy();
});

test('if publish updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'modpublish', 'publishDetails', [], () => {}, 'fi', '', '', []);
  expect(newState.publishDetails).toEqual('modpublish');
});

test('if additional text updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modaddinfofi', 'additionalInfo', [], () => {}, 'fi', '', '', []);
  expect(newState.additionalInfo?.fi).toEqual('modaddinfofi');
  newState = fairwayCardReducer(testState, 'modaddinfosv', 'additionalInfo', [], () => {}, 'sv', '', '', []);
  expect(newState.additionalInfo?.sv).toEqual('modaddinfosv');
  newState = fairwayCardReducer(testState, 'modaddinfoen', 'additionalInfo', [], () => {}, 'en', '', '', []);
  expect(newState.additionalInfo?.en).toEqual('modaddinfoen');
});

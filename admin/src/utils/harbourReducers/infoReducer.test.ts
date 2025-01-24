import { Status } from '../../graphql/generated';
import { ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { getTestState } from '../harbourReducer.test';

test('if primary id updates correctly', () => {
  const newState = harbourReducer(getTestState(), 'ModifiedId', 'primaryId', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.id).toEqual('ModifiedId'.toLowerCase());
});

test('if name updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modifiednamefi', 'name', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.name.fi).toEqual('modifiednamefi');
  newState = harbourReducer(testState, 'modifiednamesv', 'name', [], (validationErrors: ValidationType[]) => {}, 'sv', '', '', []);
  expect(newState.name.sv).toEqual('modifiednamesv');
  newState = harbourReducer(testState, 'modifiednameen', 'name', [], (validationErrors: ValidationType[]) => {}, 'en', '', '', []);
  expect(newState.name.en).toEqual('modifiednameen');
});

test('if reference level updates correctly', () => {
  const newState = harbourReducer(getTestState(), true, 'referenceLevel', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.n2000HeightSystem).toBeTruthy();
});

test('if extra info updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modextrainfofi', 'extraInfo', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.extraInfo?.fi).toEqual('modextrainfofi');
  newState = harbourReducer(testState, 'modextrainfosv', 'extraInfo', [], (validationErrors: ValidationType[]) => {}, 'sv', '', '', []);
  expect(newState.extraInfo?.sv).toEqual('modextrainfosv');
  newState = harbourReducer(testState, 'modextrainfoen', 'extraInfo', [], (validationErrors: ValidationType[]) => {}, 'en', '', '', []);
  expect(newState.extraInfo?.en).toEqual('modextrainfoen');
});

test('if cargo updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modcargofi', 'cargo', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.cargo?.fi).toEqual('modcargofi');
  newState = harbourReducer(testState, 'modcargosv', 'cargo', [], (validationErrors: ValidationType[]) => {}, 'sv', '', '', []);
  expect(newState.cargo?.sv).toEqual('modcargosv');
  newState = harbourReducer(testState, 'modcargoen', 'cargo', [], (validationErrors: ValidationType[]) => {}, 'en', '', '', []);
  expect(newState.cargo?.en).toEqual('modcargoen');
});

test('if harbour basin updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modbasinfi', 'harbourBasin', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.harborBasin?.fi).toEqual('modbasinfi');
  newState = harbourReducer(testState, 'modbasinsv', 'harbourBasin', [], (validationErrors: ValidationType[]) => {}, 'sv', '', '', []);
  expect(newState.harborBasin?.sv).toEqual('modbasinsv');
  newState = harbourReducer(testState, 'modbasinen', 'harbourBasin', [], (validationErrors: ValidationType[]) => {}, 'en', '', '', []);
  expect(newState.harborBasin?.en).toEqual('modbasinen');
});

test('if status updates correctly', () => {
  const newState = harbourReducer(getTestState(), Status.Public, 'status', [], (validationErrors: ValidationType[]) => {}, 'fi', '', '', []);
  expect(newState.status).toEqual(Status.Public);
});

test('if publish info updates correctly', () => {
  const newState = harbourReducer(
    getTestState(),
    'modpublishdetails',
    'publishDetails',
    [],
    (validationErrors: ValidationType[]) => {},
    'fi',
    '',
    '',
    []
  );
  expect(newState.publishDetails).toEqual('modpublishdetails');
});

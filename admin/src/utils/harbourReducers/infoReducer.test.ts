import { Status } from '../../graphql/generated';
import { harbourReducer } from '../harbourReducer';
import { emptyValidationParameters, getTestState } from '../harbourReducer.test';

test('if primary id updates correctly', () => {
  const newState = harbourReducer(getTestState(), 'ModifiedId', 'primaryId', emptyValidationParameters, 'fi', '', '');
  expect(newState.id).toEqual('ModifiedId'.toLowerCase());
});

test('if name updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modifiednamefi', 'name', emptyValidationParameters, 'fi', '', '');
  expect(newState.name.fi).toEqual('modifiednamefi');
  newState = harbourReducer(testState, 'modifiednamesv', 'name', emptyValidationParameters, 'sv', '', '');
  expect(newState.name.sv).toEqual('modifiednamesv');
  newState = harbourReducer(testState, 'modifiednameen', 'name', emptyValidationParameters, 'en', '', '');
  expect(newState.name.en).toEqual('modifiednameen');
});

test('if reference level updates correctly', () => {
  const newState = harbourReducer(getTestState(), true, 'referenceLevel', emptyValidationParameters, 'fi', '', '');
  expect(newState.n2000HeightSystem).toBeTruthy();
});

test('if extra info updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modextrainfofi', 'extraInfo', emptyValidationParameters, 'fi', '', '');
  expect(newState.extraInfo?.fi).toEqual('modextrainfofi');
  newState = harbourReducer(testState, 'modextrainfosv', 'extraInfo', emptyValidationParameters, 'sv', '', '');
  expect(newState.extraInfo?.sv).toEqual('modextrainfosv');
  newState = harbourReducer(testState, 'modextrainfoen', 'extraInfo', emptyValidationParameters, 'en', '', '');
  expect(newState.extraInfo?.en).toEqual('modextrainfoen');
});

test('if cargo updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modcargofi', 'cargo', emptyValidationParameters, 'fi', '', '');
  expect(newState.cargo?.fi).toEqual('modcargofi');
  newState = harbourReducer(testState, 'modcargosv', 'cargo', emptyValidationParameters, 'sv', '', '');
  expect(newState.cargo?.sv).toEqual('modcargosv');
  newState = harbourReducer(testState, 'modcargoen', 'cargo', emptyValidationParameters, 'en', '', '');
  expect(newState.cargo?.en).toEqual('modcargoen');
});

test('if harbour basin updates correctly', () => {
  const testState = getTestState();
  let newState = harbourReducer(testState, 'modbasinfi', 'harbourBasin', emptyValidationParameters, 'fi', '', '');
  expect(newState.harborBasin?.fi).toEqual('modbasinfi');
  newState = harbourReducer(testState, 'modbasinsv', 'harbourBasin', emptyValidationParameters, 'sv', '', '');
  expect(newState.harborBasin?.sv).toEqual('modbasinsv');
  newState = harbourReducer(testState, 'modbasinen', 'harbourBasin', emptyValidationParameters, 'en', '', '');
  expect(newState.harborBasin?.en).toEqual('modbasinen');
});

test('if status updates correctly', () => {
  const newState = harbourReducer(getTestState(), Status.Public, 'status', emptyValidationParameters, 'fi', '', '');
  expect(newState.status).toEqual(Status.Public);
});

test('if publish info updates correctly', () => {
  const newState = harbourReducer(getTestState(), 'modpublishdetails', 'publishDetails', emptyValidationParameters, 'fi', '', '');
  expect(newState.publishDetails).toEqual('modpublishdetails');
});

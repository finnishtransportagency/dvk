import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';
import { PilotPlaceInput } from '../../graphql/generated';

test('if pilot email updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'modpilots@gmail.com', 'pilotEmail', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.pilot?.email).toEqual('modpilots@gmail.com');
});

test('if pilot phone updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '050987654', 'pilotPhone', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.pilot?.phoneNumber).toEqual('050987654');
});
test('if pilot fax updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, '050999999', 'pilotFax', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.pilot?.fax).toEqual('050999999');
});

test('if pilot extra info updates correctly', () => {
  const testState = getTestState();
  let newState = fairwayCardReducer(testState, 'modextrainfofi', 'pilotExtraInfo', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.pilot?.extraInfo?.fi).toBe('modextrainfofi');
  newState = fairwayCardReducer(testState, 'modextrainfosv', 'pilotExtraInfo', emptyValidationParameters, 'sv', 0, '');
  expect(newState.trafficService?.pilot?.extraInfo?.sv).toBe('modextrainfosv');
  newState = fairwayCardReducer(testState, 'modextrainfoen', 'pilotExtraInfo', emptyValidationParameters, 'en', 0, '');
  expect(newState.trafficService?.pilot?.extraInfo?.en).toBe('modextrainfoen');
});

test('if pilot places update correctly', () => {
  const testState = getTestState();
  const newPilotPlace = [
    { id: 1, pilotJourney: '9' },
    { id: 2, pilotJourney: '10' },
    { id: 3, pilotJourney: '11' },
  ] as PilotPlaceInput[];
  let newState = fairwayCardReducer(testState, newPilotPlace, 'pilotPlaces', emptyValidationParameters, 'fi', 0, '');
  expect(newState.trafficService?.pilot?.places?.length).toBe(3);

  newState = fairwayCardReducer(testState, '13', 'pilotJourney', emptyValidationParameters, 'fi', 1, '');
  expect(newState.trafficService?.pilot?.places ? newState.trafficService?.pilot?.places[0].pilotJourney : '0').toBe('13');
});

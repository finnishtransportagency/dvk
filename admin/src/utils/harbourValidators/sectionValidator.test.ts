import { ErrorMessageKeys, ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { getTestState } from '../harbourReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if section validates correctly', () => {
  const testState = getTestState();
  if (testState.quays) {
    testState.quays[0]?.sections?.push({
      geometry: { lat: '0', lon: '0' },
    });
    testState.quays[0]?.sections?.push({
      geometry: { lat: '1', lon: '1' },
    });
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'section',
    {
      validationErrors: [
        { id: 'sectionGeometry-0-0', msg: '' },
        { id: 'sectionGeometry-0-1', msg: '' },
        { id: 'sectionGeometry-0-2', msg: '' },
      ],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    1,
    0
  );
  expect(errors).toHaveLength(2);
  expect(errors[0].id).toEqual('sectionGeometry-0-0');
  expect(errors[1].id).toEqual('sectionGeometry-0-1');
});

test('if section latitude/longitude validates correctly', () => {
  const testState = getTestState();
  if (testState.quays) {
    testState.quays[0]?.sections?.push({
      geometry: { lat: '', lon: '0' },
    });
    testState.quays[0]?.sections?.push({
      geometry: { lat: '1', lon: '' },
    });
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'sectionLat',
    {
      validationErrors: [
        { id: 'sectionGeometry-0-0', msg: 'dummy' },
        { id: 'sectionGeometry-0-1', msg: 'dummy' },
        { id: 'sectionGeometry-0-2', msg: 'dummy' },
      ],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    1,
    0
  );
  expect(errors).toHaveLength(3);
  expect(errors[0].id).toEqual('sectionGeometry-0-0');
  expect(errors[0].msg).toEqual('dummy');
  expect(errors[1].id).toEqual('sectionGeometry-0-2');
  expect(errors[1].msg).toEqual('dummy');
  expect(errors[2].id).toEqual('sectionGeometry-0-1');
  expect(errors[2].msg).toEqual(ErrorMessageKeys.required);
});

test('if section latitude/longitude validates correctly', () => {
  const testState = getTestState();
  if (testState.quays) {
    testState.quays[0]?.sections?.push({
      geometry: { lat: '', lon: '0' },
    });
    testState.quays[0]?.sections?.push({
      geometry: { lat: '1', lon: '' },
    });
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'sectionLon',
    {
      validationErrors: [
        { id: 'sectionGeometry-0-0', msg: 'dummy' },
        { id: 'sectionGeometry-0-1', msg: 'dummy' },
        { id: 'sectionGeometry-0-2', msg: 'dummy' },
      ],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    2,
    0
  );
  expect(errors).toHaveLength(3);
  expect(errors[0].id).toEqual('sectionGeometry-0-0');
  expect(errors[0].msg).toEqual('dummy');
  expect(errors[1].id).toEqual('sectionGeometry-0-1');
  expect(errors[1].msg).toEqual('dummy');
  expect(errors[2].id).toEqual('sectionGeometry-0-2');
  expect(errors[2].msg).toEqual(ErrorMessageKeys.required);
});

test('if section location validates correctly', () => {
  const testState = getTestState();
  if (testState.quays) {
    testState.quays[0]?.sections?.push({
      geometry: { lat: '1', lon: '0' },
    });
    testState.quays[0]?.sections?.push({
      geometry: { lat: '1', lon: '0' },
    });
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '1',
    'sectionLat',
    {
      validationErrors: [],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    1,
    0
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('sectionLocation-0-1');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.duplicateLocation);
});

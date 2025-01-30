import { ErrorMessageKeys, ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { getTestState } from '../harbourReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if quay name validates correctly', () => {
  const testState = getTestState();
  if (testState.quays && testState.quays.length > 0 && testState.quays[0]) {
    testState.quays[0].name = { en: '', fi: 'fi', sv: 'sv' };
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'quayName',
    {
      validationErrors: [{ id: 'quayName-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('quayName-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if quay extra info validates correctly', () => {
  const testState = getTestState();
  if (testState.quays && testState.quays.length > 0 && testState.quays[0]) {
    testState.quays[0].extraInfo = { en: '', fi: 'fi', sv: 'sv' };
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'quayExtraInfo',
    {
      validationErrors: [{ id: 'quayExtraInfo-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('quayExtraInfo-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if quay latitude validates correctly', () => {
  const testState = getTestState();
  if (testState.quays && testState.quays.length > 0 && testState.quays[0]?.geometry) {
    testState.quays[0].geometry.lat = '';
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'quayLat',
    {
      validationErrors: [{ id: 'quayLat-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('quayLat-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if quay longitude validates correctly', () => {
  const testState = getTestState();
  if (testState.quays && testState.quays.length > 0 && testState.quays[0]?.geometry) {
    testState.quays[0].geometry.lon = '';
  }
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'quayLon',
    {
      validationErrors: [{ id: 'quayLon-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('quayLon-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if quay location validates correctly', () => {
  const testState = getTestState();
  if (testState.quays && testState.quays.length > 0 && testState.quays[0]?.geometry) {
    testState.quays[0].geometry = { lat: '20.1', lon: '60.1' };
  }
  testState.quays?.push({
    geometry: { lat: '20.0', lon: '60.1' },
  });
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '20.1',
    'quayLat',
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
  expect(errors[0].id).toEqual('quayLocation-1');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.duplicateLocation);
});

test('if quay validates correctly', () => {
  const testState = getTestState();
  testState.quays?.push({
    name: { fi: 'quayname2fi', sv: 'quayname2sv', en: 'quayname2en' },
  });
  testState.quays?.push({
    name: { fi: 'quayname3fi', sv: 'quayname3sv', en: 'quayname3en' },
  });
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'quay',
    {
      validationErrors: [
        { id: 'quayName-0', msg: '' },
        { id: 'quayName-1', msg: '' },
        { id: 'quayName-2', msg: '' },
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
  expect(errors[0].id).toEqual('quayName-0');
  expect(errors[1].id).toEqual('quayName-1');
});

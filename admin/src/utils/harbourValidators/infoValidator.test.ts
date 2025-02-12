import { Operation } from '../../graphql/generated';
import { ErrorMessageKeys, ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { getTestState } from '../harbourReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if duplicate id validates correctly', () => {
  const testState = getTestState();
  testState.operation = Operation.Create;

  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    'create1',
    'primaryId',
    {
      validationErrors: [],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: ['create1', 'create2'],
    },
    'fi',
    0,
    0
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('primaryId');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.duplicateId);
});

test('if empty string id validates correctly', () => {
  const testState = getTestState();
  testState.operation = Operation.Create;

  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'primaryId',
    {
      validationErrors: [],
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
  expect(errors[0].id).toEqual('primaryId');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if new id validates correctly', () => {
  const testState = getTestState();
  testState.operation = Operation.Create;

  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    'create3',
    'primaryId',
    {
      validationErrors: [],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: ['create1', 'create2'],
    },
    'fi',
    0,
    0
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('primaryId');
  expect(errors[0].msg).toEqual('');
});

test('if name validates correctly', () => {
  const errors: ValidationType[] = [];
  harbourReducer(
    getTestState(),
    '',
    'name',
    {
      validationErrors: [{ id: 'name', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('name');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if latitude validates correctly', () => {
  const errors: ValidationType[] = [];
  harbourReducer(
    getTestState(),
    '',
    'lat',
    {
      validationErrors: [{ id: 'lat', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('lat');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if longitude validates correctly', () => {
  const errors: ValidationType[] = [];
  harbourReducer(
    getTestState(),
    '',
    'lon',
    {
      validationErrors: [{ id: 'lon', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('lon');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if cargo validates correctly', () => {
  const testState = getTestState();
  testState.cargo = { en: '', fi: 'fi', sv: 'sv' };
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'cargo',
    {
      validationErrors: [{ id: 'cargo', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('cargo');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if harbour basin validates correctly', () => {
  const testState = getTestState();
  testState.harborBasin = { en: '', fi: 'fi', sv: 'sv' };
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'harbourBasin',
    {
      validationErrors: [{ id: 'harbourBasin', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('harbourBasin');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if extra info validates correctly', () => {
  const testState = getTestState();
  testState.extraInfo = { en: '', fi: 'fi', sv: 'sv' };
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'extraInfo',
    {
      validationErrors: [{ id: 'extraInfo', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('extraInfo');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

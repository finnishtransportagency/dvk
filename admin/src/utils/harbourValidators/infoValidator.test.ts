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
    [],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    ['create1', 'create2']
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
    [],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    []
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
    [],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    ['create1', 'create2']
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
    [{ id: 'name', msg: 'dummy' }],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    []
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
    [{ id: 'lat', msg: 'dummy' }],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    []
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
    [{ id: 'lon', msg: 'dummy' }],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    []
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
    [{ id: 'cargo', msg: 'dummy' }],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    []
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
    [{ id: 'harbourBasin', msg: 'dummy' }],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    []
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
    [{ id: 'extraInfo', msg: 'dummy' }],
    (validationErrors: ValidationType[]) => {
      validationErrors.forEach((e) => errors.push(e));
    },
    'fi',
    0,
    0,
    []
  );
  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('extraInfo');
  expect(errors[0].msg).toEqual('general.required-field');
});

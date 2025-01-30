import { Operation } from '../../graphql/generated';
import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if new id validates correctly', () => {
  const testState = getTestState();
  testState.operation = Operation.Create;

  const errors: ValidationType[] = [];
  fairwayCardReducer(
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
  const testState = getTestState();
  testState.name = { en: 'en', fi: 'fi', sv: 'sv' };
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
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

test('if fairwayIds list validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    [],
    'fairwayIds',
    {
      validationErrors: [{ id: 'fairwayIds', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('fairwayIds');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if fairway primary ids list validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    [],
    'fairwayPrimary',
    {
      validationErrors: [{ id: 'fairwayPrimary', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('fairwayPrimary');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if fairway secondary ids list validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    [],
    'fairwaySecondary',
    {
      validationErrors: [{ id: 'fairwaySecondary', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('fairwaySecondary');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if group validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'group',
    {
      validationErrors: [{ id: 'group', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('group');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

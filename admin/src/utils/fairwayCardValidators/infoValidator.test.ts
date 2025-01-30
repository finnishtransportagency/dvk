import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if line validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'line',
    {
      validationErrors: [{ id: 'line', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('line');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if design speed validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'designSpeed',
    {
      validationErrors: [{ id: 'designSpeed', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('designSpeed');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if speed limit validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'speedLimit',
    {
      validationErrors: [{ id: 'speedLimit', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('speedLimit');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if anchorage validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'anchorage',
    {
      validationErrors: [{ id: 'anchorage', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('anchorage');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});
